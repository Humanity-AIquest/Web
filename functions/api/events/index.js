/**
 * /api/events
 * GET  — Public list of events.
 * POST — Admin only (ACL editor+): create an event.
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

export async function onRequestGet(context) {
  const { env } = context;
  try {
    await ensureMovementSchema(env);
    const rows = await env.DB.prepare(
      `SELECT id, title, when_text, type, blurb FROM events ORDER BY created_at ASC`
    ).all();
    return json({ events: rows.results || [] });
  } catch (err) {
    return jsonError("Could not load events: " + err.message);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const denied = requireACL(user, 3); // editor+
    if (denied) return denied;

    const { title, when_text, type, blurb } = await request.json();
    if (!title) return jsonError("An event needs a title.");

    const id = newId();
    await env.DB.prepare(
      `INSERT INTO events (id, title, when_text, type, blurb) VALUES (?,?,?,?,?)`
    ).bind(id, title.trim(), when_text || null, type || "Event", blurb || null).run();

    return json({ success: true, id });
  } catch (err) {
    return jsonError("Could not create event: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
