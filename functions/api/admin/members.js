/**
 * /api/admin/members — unified Member Profile / CRM (admin)
 *
 * A "member" is keyed by lowercased EMAIL (the common identifier across
 * signatures, pitches, RSVPs and user accounts). Anonymous survey votes are
 * intentionally NOT attributed to a person.
 *
 * GET  ?q=         → searchable member list
 * GET  ?email=     → full profile: identity, cross-source timeline, notes,
 *                    contacts, follow-ups, tags, membership, moderation history
 * POST             → CRM actions (notes / contacts / follow-ups / tags / membership)
 *
 * View requires L1; CRM mutations require L2.
 * Covers use cases: 1 (profile+timeline), 7 (pledge), 9 (contact log),
 * 10 (follow-ups), 13 (notes), 14 (tags), 16 (moderation history), 27 (outreach).
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";

async function ensureMemberSchema(env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_notes (
    id TEXT PRIMARY KEY, member_email TEXT NOT NULL, author_id TEXT,
    note TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_contacts (
    id TEXT PRIMARY KEY, member_email TEXT NOT NULL, author_id TEXT,
    channel TEXT, direction TEXT DEFAULT 'inbound', summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_followups (
    id TEXT PRIMARY KEY, member_email TEXT NOT NULL, author_id TEXT,
    title TEXT NOT NULL, due_date TEXT, status TEXT DEFAULT 'open',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_tags (
    id TEXT PRIMARY KEY, member_email TEXT NOT NULL, tag TEXT NOT NULL,
    UNIQUE(member_email, tag)
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_membership (
    member_email TEXT PRIMARY KEY, monthly_pledge TEXT,
    is_founding INTEGER DEFAULT 0, status TEXT, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  // Member fields collected at signup (idempotent; signup also self-migrates).
  for (const col of ["phone TEXT", "country TEXT", "newsletter INTEGER DEFAULT 0"]) {
    try { await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${col}`).run(); } catch (e) { /* exists */ }
  }
  // Audit table (so the moderation-history query never throws on a missing table).
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_actions (
    id TEXT PRIMARY KEY, admin_id TEXT, action_type TEXT, target_type TEXT,
    target_id TEXT, details TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

const norm = (e) => (e || "").trim().toLowerCase();

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await ensureMemberSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const email = norm(url.searchParams.get("email"));

    // ── Single profile ──────────────────────────────────────────────────────
    if (email) {
      const account = await env.DB.prepare(
        "SELECT id, email, display_name, role, acl_level, status, created_at, phone, country, newsletter FROM users WHERE email = ?"
      ).bind(email).first().catch(() => null);

      const sig = await env.DB.prepare(
        "SELECT name, country, side, created_at FROM signatures WHERE email = ? ORDER BY created_at ASC LIMIT 1"
      ).bind(email).first().catch(() => null);

      const name = account?.display_name || sig?.name || email;

      // Cross-source timeline from the unified interactions index.
      // participant holds the email (sign/pitch/rsvp) OR the user_id (chats/ideas).
      const keys = [email];
      if (account?.id) keys.push(account.id);
      const placeholders = keys.map(() => "?").join(",");
      const timeline = await env.DB.prepare(
        `SELECT kind, ref_type, ref_id, summary, created_at FROM interactions
         WHERE participant IN (${placeholders}) ORDER BY created_at DESC LIMIT 100`
      ).bind(...keys).all().catch(() => ({ results: [] }));

      const [notes, contacts, followups, tags, membership] = await Promise.all([
        env.DB.prepare("SELECT id, note, author_id, created_at FROM member_notes WHERE member_email = ? ORDER BY created_at DESC").bind(email).all().catch(() => ({ results: [] })),
        env.DB.prepare("SELECT id, channel, direction, summary, created_at FROM member_contacts WHERE member_email = ? ORDER BY created_at DESC").bind(email).all().catch(() => ({ results: [] })),
        env.DB.prepare("SELECT id, title, due_date, status, created_at FROM member_followups WHERE member_email = ? ORDER BY (status='open') DESC, due_date ASC").bind(email).all().catch(() => ({ results: [] })),
        env.DB.prepare("SELECT tag FROM member_tags WHERE member_email = ?").bind(email).all().catch(() => ({ results: [] })),
        env.DB.prepare("SELECT monthly_pledge, is_founding, status FROM member_membership WHERE member_email = ?").bind(email).first().catch(() => null),
      ]);

      // Moderation history — admin actions targeting this person's account.
      let moderation = { results: [] };
      if (account?.id) {
        moderation = await env.DB.prepare(
          "SELECT action_type, details, created_at FROM admin_actions WHERE target_type = 'user' AND target_id = ? ORDER BY created_at DESC LIMIT 20"
        ).bind(account.id).all().catch(() => ({ results: [] }));
      }

      return json({
        member: {
          email, name,
          country: sig?.country || null,
          side: sig?.side || null,
          signed: !!sig,
          account: account || null,
          status: account?.status || null,
          timeline: timeline.results || [],
          notes: notes.results || [],
          contacts: contacts.results || [],
          followups: followups.results || [],
          tags: (tags.results || []).map(r => r.tag),
          membership: membership || { monthly_pledge: null, is_founding: 0, status: null },
          moderation: moderation.results || [],
        },
      });
    }

    // ── Member list (deduped by email; signatures + accounts) ────────────────
    const q = (url.searchParams.get("q") || "").trim();
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;
    const like = `%${q}%`;
    const filter = q ? "WHERE m.email LIKE ? OR m.name LIKE ?" : "";
    const args = q ? [like, like] : [];

    const rows = await env.DB.prepare(
      `SELECT m.email, MAX(m.name) AS name, MAX(m.country) AS country, MAX(m.has_account) AS has_account,
              mm.monthly_pledge, mm.is_founding
       FROM (
         SELECT email, name, country, 0 AS has_account FROM signatures
         UNION ALL
         SELECT email, display_name AS name, NULL AS country, 1 AS has_account FROM users
       ) m
       LEFT JOIN member_membership mm ON mm.member_email = m.email
       ${filter}
       GROUP BY m.email
       ORDER BY (mm.is_founding) DESC, name ASC
       LIMIT ? OFFSET ?`
    ).bind(...args, limit, offset).all().catch(() => ({ results: [] }));

    return json({ members: rows.results || [], page });
  } catch (err) {
    return jsonError("Failed to load members: " + err.message);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureMemberSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 2);
    if (aclError) return aclError;

    const body = await request.json();
    const { action } = body;
    const email = norm(body.email);
    if (!action) return jsonError("action required.");

    switch (action) {
      case "add_note":
        if (!email || !body.note) return jsonError("email and note required.");
        await env.DB.prepare("INSERT INTO member_notes (id, member_email, author_id, note) VALUES (?,?,?,?)")
          .bind(newId(), email, user.id, body.note.trim()).run();
        return json({ success: true });
      case "delete_note":
        await env.DB.prepare("DELETE FROM member_notes WHERE id = ?").bind(body.id).run();
        return json({ success: true });

      case "add_contact":
        if (!email) return jsonError("email required.");
        await env.DB.prepare("INSERT INTO member_contacts (id, member_email, author_id, channel, direction, summary) VALUES (?,?,?,?,?,?)")
          .bind(newId(), email, user.id, body.channel || "email", body.direction || "inbound", (body.summary || "").trim()).run();
        return json({ success: true });
      case "delete_contact":
        await env.DB.prepare("DELETE FROM member_contacts WHERE id = ?").bind(body.id).run();
        return json({ success: true });

      case "add_followup":
        if (!email || !body.title) return jsonError("email and title required.");
        await env.DB.prepare("INSERT INTO member_followups (id, member_email, author_id, title, due_date) VALUES (?,?,?,?,?)")
          .bind(newId(), email, user.id, body.title.trim(), body.due_date || null).run();
        return json({ success: true });
      case "update_followup":
        await env.DB.prepare("UPDATE member_followups SET status = ? WHERE id = ?").bind(body.status || "done", body.id).run();
        return json({ success: true });
      case "delete_followup":
        await env.DB.prepare("DELETE FROM member_followups WHERE id = ?").bind(body.id).run();
        return json({ success: true });

      case "add_tag":
        if (!email || !body.tag) return jsonError("email and tag required.");
        try { await env.DB.prepare("INSERT INTO member_tags (id, member_email, tag) VALUES (?,?,?)").bind(newId(), email, body.tag.trim()).run(); } catch (e) { /* dup */ }
        return json({ success: true });
      case "remove_tag":
        await env.DB.prepare("DELETE FROM member_tags WHERE member_email = ? AND tag = ?").bind(email, body.tag).run();
        return json({ success: true });

      case "set_membership":
        if (!email) return jsonError("email required.");
        await env.DB.prepare(
          `INSERT INTO member_membership (member_email, monthly_pledge, is_founding, status, updated_at)
           VALUES (?,?,?,?,datetime('now'))
           ON CONFLICT(member_email) DO UPDATE SET monthly_pledge=excluded.monthly_pledge, is_founding=excluded.is_founding, status=excluded.status, updated_at=datetime('now')`
        ).bind(email, body.monthly_pledge || null, body.is_founding ? 1 : 0, body.status || null).run();
        return json({ success: true });

      default:
        return jsonError("Invalid action.");
    }
  } catch (err) {
    return jsonError("Member action failed: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
