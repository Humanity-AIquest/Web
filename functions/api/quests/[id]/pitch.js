/**
 * /api/quests/:id/pitch
 * POST — Register to pitch a solution. Body: { name, email, approach }
 */
import { json, jsonError, optionsResponse, newId } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

export async function onRequestPost(context) {
  const { request, env, params } = context;
  try {
    await ensureMovementSchema(env);
    const quest = await env.DB.prepare("SELECT id, status FROM quests WHERE id = ?").bind(params.id).first();
    if (!quest) return jsonError("Quest not found.", 404);
    if (quest.status !== "Open") return jsonError("This quest is closed to new pitches.");

    const { name, email, approach } = await request.json();
    if (!name || name.trim().length < 2) return jsonError("Please add your name.");
    if (!validEmail(email)) return jsonError("Please add a valid email.");

    await env.DB.prepare(
      `INSERT INTO quest_pitches (id, quest_id, name, email, approach) VALUES (?,?,?,?,?)`
    ).bind(newId(), params.id, name.trim(), email.trim().toLowerCase(), (approach || "").trim()).run();

    return json({ success: true, message: "Your pitch is registered. We'll be in touch about the next pitch night." });
  } catch (err) {
    return jsonError("Could not register your pitch: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
