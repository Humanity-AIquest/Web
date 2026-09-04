/**
 * /api/quests/:id
 * GET — Quest detail with its Q&A thread.
 */
import { json, jsonError, optionsResponse } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

export async function onRequestGet(context) {
  const { env, params } = context;
  try {
    await ensureMovementSchema(env);
    const quest = await env.DB.prepare(
      `SELECT id, title, bounty, status, summary, problem, tags FROM quests WHERE id = ?`
    ).bind(params.id).first();
    if (!quest) return jsonError("Quest not found.", 404);

    let tags = [];
    try { const a = JSON.parse(quest.tags); tags = Array.isArray(a) ? a : []; } catch {}

    const qa = await env.DB.prepare(
      `SELECT id, author, question, answer FROM quest_questions WHERE quest_id = ? ORDER BY created_at ASC`
    ).bind(params.id).all();

    return json({ quest: { ...quest, tags, questions: qa.results || [] } });
  } catch (err) {
    return jsonError("Could not load quest: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
