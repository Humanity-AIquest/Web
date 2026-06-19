/**
 * /api/events/:id/rsvp
 * POST — RSVP to an event. Body: { name, email }
 */
import { json, jsonError, optionsResponse, newId } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

export async function onRequestPost(context) {
  const { request, env, params } = context;
  try {
    await ensureMovementSchema(env);
    const event = await env.DB.prepare("SELECT id FROM events WHERE id = ?").bind(params.id).first();
    if (!event) return jsonError("Event not found.", 404);

    const { name, email } = await request.json();
    if (!name || name.trim().length < 2) return jsonError("Please add your name.");
    if (!validEmail(email)) return jsonError("Please add a valid email.");

    await env.DB.prepare(
      `INSERT INTO event_rsvps (id, event_id, name, email) VALUES (?,?,?,?)`
    ).bind(newId(), params.id, name.trim(), email.trim().toLowerCase()).run();

    return json({ success: true, message: "You're on the list. We'll send details by email." });
  } catch (err) {
    return jsonError("Could not RSVP: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
