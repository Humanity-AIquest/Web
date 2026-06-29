/**
 * /api/admin/events — Events manager (admin)
 * GET  — all events, each with their rsvps[]
 * POST — actions: delete_rsvp | delete_event
 *
 * View requires L1; mutations require L3.
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    const events = await env.DB.prepare(
      `SELECT id, title, when_text, type, blurb, created_at FROM events ORDER BY created_at DESC`
    ).all();

    const out = [];
    for (const e of events.results || []) {
      const rsvps = await env.DB.prepare(
        `SELECT id, name, email, created_at FROM event_rsvps WHERE event_id = ? ORDER BY created_at DESC`
      ).bind(e.id).all();
      out.push({ ...e, rsvps: rsvps.results || [] });
    }
    return json({ events: out });
  } catch (err) {
    return jsonError("Failed to list events: " + err.message);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 3);
    if (aclError) return aclError;

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "delete_rsvp": {
        if (!body.rsvp_id) return jsonError("rsvp_id required.");
        await env.DB.prepare("DELETE FROM event_rsvps WHERE id = ?").bind(body.rsvp_id).run();
        return json({ success: true });
      }
      case "delete_event": {
        if (!body.event_id) return jsonError("event_id required.");
        await env.DB.prepare("DELETE FROM event_rsvps WHERE event_id = ?").bind(body.event_id).run();
        await env.DB.prepare("DELETE FROM events WHERE id = ?").bind(body.event_id).run();
        try {
          await env.DB.prepare(
            "INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, details) VALUES (?, ?, 'delete', 'event', ?, 'Deleted event + RSVPs')"
          ).bind(newId(), user.id, body.event_id).run();
        } catch (e) { /* audit best-effort */ }
        return json({ success: true });
      }
      default:
        return jsonError("Invalid action.");
    }
  } catch (err) {
    return jsonError("Event action failed: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
