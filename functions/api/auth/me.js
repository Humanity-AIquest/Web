/**
 * GET /api/auth/me
 * Returns current user info (if logged in)
 * Ideas query wrapped in its own try/catch so a missing table never breaks auth
 */
import { json, jsonError, optionsResponse, getUser } from "../_shared.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const user = await getUser(request, env);
    if (!user) {
      return json({ authenticated: false });
    }

    // Ensure ideas table exists (auto-migrate)
    const ideaCols = ['ledger_hash TEXT', 'prev_hash TEXT', 'clause_refs TEXT', 'conversation_id TEXT', 'tags TEXT'];
    try {
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        status TEXT DEFAULT 'submitted',
        clause_refs TEXT,
        conversation_id TEXT,
        ledger_hash TEXT,
        prev_hash TEXT,
        tags TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`).run();
    } catch(e) { /* already exists */ }
    for (const col of ideaCols) {
      try { await env.DB.prepare(`ALTER TABLE ideas ADD COLUMN ${col}`).run(); } catch(e) {}
    }

    // Fetch user's ideas — separate try/catch so auth still works if table is weird
    let ideas = [];
    try {
      const result = await env.DB.prepare(
        `SELECT id, title, status, clause_refs, created_at
         FROM ideas
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 50`
      ).bind(user.id).all();
      ideas = result.results || [];

      // Attach latest visible comment to each idea
      for (let i = 0; i < ideas.length; i++) {
        try {
          const log = await env.DB.prepare(
            `SELECT comment, created_at FROM idea_status_log
             WHERE idea_id = ? AND visible_to_user = 1
             ORDER BY created_at DESC LIMIT 1`
          ).bind(ideas[i].id).first();
          ideas[i].latest_comment = log?.comment || null;
          ideas[i].last_updated = log?.created_at || null;
        } catch(e) { /* status log table may not exist */ }
      }
    } catch(e) {
      // ideas table genuinely doesn't exist yet — return empty array, don't break auth
      ideas = [];
    }

    return json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        acl_level: user.acl_level,
      },
      ideas,
    });
  } catch (err) {
    return jsonError("Failed to get user info: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
