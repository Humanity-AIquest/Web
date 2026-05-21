/**
 * /api/ideas
 * POST — Submit a new idea (registered users only)
 * GET  — Get my ideas with status history
 */
import { json, jsonError, optionsResponse, getUser, newId } from "./_shared.js";

// ─── SHA-256 hash for immutable ledger ────────────────────────────────────────
async function computeLedgerHash(content, prevHash) {
  const payload = `${prevHash || "GENESIS"}|${content}|${new Date().toISOString()}`;
  const encoded = new TextEncoder().encode(payload);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── POST: Submit Idea ────────────────────────────────────────────────────────
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const user = await getUser(request, env);
    if (!user) {
      return jsonError("You must be logged in to submit an idea. Your contribution matters — please create an account so we can attribute your input per Clause I.1.");
    }

    const body = await request.json();
    const { title, content, clause_refs, conversation_id } = body;

    if (!title || !content) {
      return jsonError("Please provide a title and description for your idea.");
    }
    if (title.length > 200) {
      return jsonError("Title must be 200 characters or less.");
    }
    if (content.length > 5000) {
      return jsonError("Idea description must be 5000 characters or less.");
    }

    // Get previous hash for chain integrity
    const lastIdea = await env.DB.prepare(
      "SELECT ledger_hash FROM ideas ORDER BY created_at DESC LIMIT 1"
    ).first();
    const prevHash = lastIdea?.ledger_hash || null;

    // Compute hash
    const ledgerHash = await computeLedgerHash(
      JSON.stringify({ title, content, user_id: user.id }),
      prevHash
    );

    const ideaId = newId();

    await env.DB.prepare(
      `INSERT INTO ideas (id, user_id, conversation_id, title, content, clause_refs, status, ledger_hash, prev_hash)
       VALUES (?, ?, ?, ?, ?, ?, 'submitted', ?, ?)`
    ).bind(
      ideaId, user.id, conversation_id || null,
      title.trim(), content.trim(),
      clause_refs || null,
      ledgerHash, prevHash
    ).run();

    // Log initial status
    await env.DB.prepare(
      `INSERT INTO idea_status_log (id, idea_id, old_status, new_status, comment, visible_to_user)
       VALUES (?, ?, NULL, 'submitted', 'Your idea has been received. Thank you for contributing to the HRC.', 1)`
    ).bind(newId(), ideaId).run();

    return json({
      success: true,
      idea: {
        id: ideaId,
        title: title.trim(),
        status: "submitted",
        ledger_hash: ledgerHash,
        message: "Your idea has been recorded on the immutable ledger per Clause I.1. You can track its status in your account."
      }
    });
  } catch (err) {
    return jsonError("Failed to submit idea. Please try again.");
  }
}

// ─── GET: My Ideas ────────────────────────────────────────────────────────────
export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const user = await getUser(request, env);
    if (!user) {
      return jsonError("Please log in to view your ideas.");
    }

    const ideas = await env.DB.prepare(
      `SELECT i.id, i.title, i.content, i.clause_refs, i.status, i.ledger_hash,
              i.created_at
       FROM ideas i
       WHERE i.user_id = ?
       ORDER BY i.created_at DESC
       LIMIT 100`
    ).bind(user.id).all();

    // Get status history for each idea
    const ideasWithHistory = [];
    for (const idea of ideas.results || []) {
      const history = await env.DB.prepare(
        `SELECT new_status, comment, visible_to_user, created_at
         FROM idea_status_log
         WHERE idea_id = ? AND visible_to_user = 1
         ORDER BY created_at ASC`
      ).bind(idea.id).all();

      ideasWithHistory.push({
        ...idea,
        status_history: history.results || [],
      });
    }

    return json({ ideas: ideasWithHistory });
  } catch (err) {
    return jsonError("Failed to load ideas.");
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
