/**
 * /api/surveys
 * GET — list of LIVE surveys for the public Surveys page (excludes petition-bound
 * surveys, which render inside the petition wizard, not the surveys index).
 */
import { json, jsonError, optionsResponse } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

export async function onRequestGet(context) {
  const { env } = context;
  try {
    await ensureMovementSchema(env);
    const rows = await env.DB.prepare(
      `SELECT s.id, s.title, s.intro, s.location,
              (SELECT COUNT(*) FROM survey_statements ss
                 WHERE ss.survey_id = s.id AND (ss.type IS NULL OR ss.type = 'vote')) AS statement_count
       FROM surveys s
       WHERE s.status IN ('live','open')
         AND (s.location IS NULL OR s.location <> 'petition')
       ORDER BY s.sort_order ASC, s.created_at DESC`
    ).all();
    return json({ surveys: rows.results || [] });
  } catch (err) {
    return jsonError("Could not load surveys: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
