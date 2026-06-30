/**
 * /api/surveys/:id
 * GET — A survey with its statements.
 */
import { json, jsonError, optionsResponse } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

export async function onRequestGet(context) {
  const { env, params } = context;
  try {
    await ensureMovementSchema(env);
    const survey = await env.DB.prepare(
      `SELECT id, title, intro, status FROM surveys WHERE id = ?`
    ).bind(params.id).first();
    if (!survey) return jsonError("Survey not found.", 404);

    const statements = await env.DB.prepare(
      `SELECT id, text, type, sort_order FROM survey_statements WHERE survey_id = ? ORDER BY sort_order ASC, created_at ASC`
    ).bind(params.id).all();

    return json({ survey: { ...survey, statements: statements.results || [] } });
  } catch (err) {
    return jsonError("Could not load survey: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
