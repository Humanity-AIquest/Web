/**
 * /api/events/:id/rsvp
 * POST — RSVP to an event. Body: { name, email }
 */
import { json, jsonError, optionsResponse, newId } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";
import { ensureConversationSchema, logInteraction } from "../../_conversations.js";

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

    try {
      await ensureConversationSchema(env);
      await logInteraction(env, {
        kind: "event_rsvp", participant: email.trim().toLowerCase(),
        ref_type: "event", ref_id: params.id,
        summary: `${name.trim()} RSVP'd to an event`,
      });
    } catch (e) { /* index write is best-effort */ }

    return json({ success: true, message: "You're on the list. We'll send details by email." });
  } catch (err) {
    return jsonError("Could not RSVP: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
