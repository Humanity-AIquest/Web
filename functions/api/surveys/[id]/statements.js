/**
 * /api/surveys/:id/statements
 * POST — Add a participant statement for others to vote on. Body: { text, author? }
 */
import { json, jsonError, optionsResponse, newId } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";

export async function onRequestPost(context) {
  const { request, env, params } = context;
  try {
    await ensureMovementSchema(env);
    const survey = await env.DB.prepare("SELECT id, status FROM surveys WHERE id = ?").bind(params.id).first();
    if (!survey) return jsonError("Survey not found.", 404);
    if (survey.status !== "open") return jsonError("This survey is closed.");

    const { text, author } = await request.json();
    if (!text || text.trim().length < 4) return jsonError("Please write a statement.");
    if (text.length > 280) return jsonError("Statements must be 280 characters or less.");

    const id = newId();
    await env.DB.prepare(
      `INSERT INTO survey_statements (id, survey_id, text, author) VALUES (?,?,?,?)`
    ).bind(id, params.id, text.trim(), (author || "").trim() || null).run();

    return json({ success: true, id });
  } catch (err) {
    return jsonError("Could not add your statement: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
