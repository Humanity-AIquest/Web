/**
 * /api/admin/conversations
 * GET — List conversations with filters (L1+)
 * PUT — Flag a conversation (L2+)
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";

// GET /api/admin/conversations?type=anon|registered&flagged=1&page=1
export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const type = url.searchParams.get("type");
    const flagged = url.searchParams.get("flagged");
    const page = parseInt(url.searchParams.get("page") || "1");
    const id = url.searchParams.get("id"); // single conversation
    const limit = 50;
    const offset = (page - 1) * limit;

    // Single conversation with messages
    if (id) {
      const conv = await env.DB.prepare(
        `SELECT c.*, u.email, u.display_name
         FROM conversations c LEFT JOIN users u ON c.user_id = u.id
         WHERE c.id = ?`
      ).bind(id).first();

      if (!conv) return jsonError("Conversation not found.");

      const msgs = await env.DB.prepare(
        "SELECT id, role, content, flagged, flag_reason, created_at FROM messages WHERE conversation_id = ? ORDER BY created_at ASC"
      ).bind(id).all();

      return json({ conversation: conv, messages: msgs.results || [] });
    }

    // List conversations
    let query = `SELECT c.id, c.user_type, c.started_at, c.flagged,
                        u.email, u.display_name,
                        (SELECT COUNT(*) FROM messages m WHERE m.conversation_id = c.id) as message_count,
                        (SELECT m.content FROM messages m WHERE m.conversation_id = c.id AND m.role = 'user' ORDER BY m.created_at ASC LIMIT 1) as first_message
                 FROM conversations c LEFT JOIN users u ON c.user_id = u.id WHERE 1=1`;
    const params = [];

    if (type) { query += " AND c.user_type = ?"; params.push(type); }
    if (flagged === "1") { query += " AND c.flagged = 1"; }

    query += " ORDER BY c.started_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const result = await env.DB.prepare(query).bind(...params).all();

    return json({
      conversations: result.results || [],
      page,
    });
  } catch (err) {
    return jsonError("Failed to list conversations.");
  }
}

// PUT /api/admin/conversations — body: { conversation_id, flagged }
export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const user = await getUser(request, env);
    const aclError = requireACL(user, 2);
    if (aclError) return aclError;

    const body = await request.json();
    const { conversation_id, flagged } = body;

    if (!conversation_id) return jsonError("conversation_id required.");

    await env.DB.prepare("UPDATE conversations SET flagged = ? WHERE id = ?")
      .bind(flagged ? 1 : 0, conversation_id).run();

    await env.DB.prepare(
      "INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, 'conversation', ?, ?)"
    ).bind(newId(), user.id, flagged ? "flag" : "unflag", conversation_id, flagged ? "Flagged conversation" : "Unflagged conversation").run();

    return json({ success: true });
  } catch (err) {
    return jsonError("Failed to update conversation.");
  }
}

export async function onRequestOptions() { return optionsResponse(); }
