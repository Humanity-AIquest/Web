/**
 * /api/quests/:id/questions
 * POST — Ask a question on a quest thread. Body: { author, question }
 */
import { json, jsonError, optionsResponse, newId } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";
import { ensureConversationSchema, logInteraction } from "../../_conversations.js";

export async function onRequestPost(context) {
  const { request, env, params } = context;
  try {
    await ensureMovementSchema(env);
    const quest = await env.DB.prepare("SELECT id FROM quests WHERE id = ?").bind(params.id).first();
    if (!quest) return jsonError("Quest not found.", 404);

    const { author, question } = await request.json();
    if (!question || question.trim().length < 3) return jsonError("Please write your question.");

    const id = newId();
    await env.DB.prepare(
      `INSERT INTO quest_questions (id, quest_id, author, question) VALUES (?,?,?,?)`
    ).bind(id, params.id, (author || "Anonymous").trim(), question.trim()).run();

    try {
      await ensureConversationSchema(env);
      await logInteraction(env, {
        kind: "quest_question", participant: (author || "Anonymous").trim(),
        ref_type: "quest", ref_id: params.id,
        summary: `Question: ${question.trim()}`,
      });
    } catch (e) { /* index write is best-effort */ }

    return json({ success: true, id });
  } catch (err) {
    return jsonError("Could not post your question: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
