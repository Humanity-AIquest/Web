/**
 * /api/admin/quests — Quests manager (admin)
 * GET  — all quests, each with their pitches[] and questions[]
 * POST — actions: answer_question | set_status | delete_pitch | delete_question
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

    const quests = await env.DB.prepare(
      `SELECT id, title, bounty, status, summary, tags, created_at FROM quests ORDER BY created_at DESC`
    ).all();

    const out = [];
    for (const q of quests.results || []) {
      const pitches = await env.DB.prepare(
        `SELECT id, name, email, approach, created_at FROM quest_pitches WHERE quest_id = ? ORDER BY created_at DESC`
      ).bind(q.id).all();
      const questions = await env.DB.prepare(
        `SELECT id, author, question, answer, created_at FROM quest_questions WHERE quest_id = ? ORDER BY created_at DESC`
      ).bind(q.id).all();
      out.push({ ...q, pitches: pitches.results || [], questions: questions.results || [] });
    }
    return json({ quests: out });
  } catch (err) {
    return jsonError("Failed to list quests: " + err.message);
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
      case "answer_question": {
        if (!body.question_id) return jsonError("question_id required.");
        await env.DB.prepare("UPDATE quest_questions SET answer = ? WHERE id = ?")
          .bind((body.answer || "").trim(), body.question_id).run();
        return json({ success: true });
      }
      case "set_status": {
        if (!body.quest_id || !body.status) return jsonError("quest_id and status required.");
        await env.DB.prepare("UPDATE quests SET status = ? WHERE id = ?").bind(body.status, body.quest_id).run();
        try {
          await env.DB.prepare(
            "INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, details) VALUES (?, ?, 'set_status', 'quest', ?, ?)"
          ).bind(newId(), user.id, body.quest_id, `Status → ${body.status}`).run();
        } catch (e) { /* audit best-effort */ }
        return json({ success: true });
      }
      case "delete_pitch": {
        if (!body.pitch_id) return jsonError("pitch_id required.");
        await env.DB.prepare("DELETE FROM quest_pitches WHERE id = ?").bind(body.pitch_id).run();
        return json({ success: true });
      }
      case "delete_question": {
        if (!body.question_id) return jsonError("question_id required.");
        await env.DB.prepare("DELETE FROM quest_questions WHERE id = ?").bind(body.question_id).run();
        return json({ success: true });
      }
      default:
        return jsonError("Invalid action.");
    }
  } catch (err) {
    return jsonError("Quest action failed: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
