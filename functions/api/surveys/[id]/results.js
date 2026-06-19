/**
 * /api/surveys/:id/results
 * GET — Per-statement tallies (agree / disagree / pass).
 * Phase 1: simple counts. Opinion clustering (pol.is-style) is a later phase.
 */
import { json, jsonError, optionsResponse } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";

export async function onRequestGet(context) {
  const { env, params } = context;
  try {
    await ensureMovementSchema(env);
    const statements = await env.DB.prepare(
      `SELECT id, text FROM survey_statements WHERE survey_id = ? ORDER BY created_at ASC`
    ).bind(params.id).all();

    const results = [];
    for (const s of statements.results || []) {
      const tally = await env.DB.prepare(
        `SELECT
           SUM(CASE WHEN value='agree' THEN 1 ELSE 0 END) AS agree,
           SUM(CASE WHEN value='disagree' THEN 1 ELSE 0 END) AS disagree,
           SUM(CASE WHEN value='pass' THEN 1 ELSE 0 END) AS pass
         FROM survey_votes WHERE statement_id = ?`
      ).bind(s.id).first();
      results.push({
        statementId: s.id,
        text: s.text,
        agree: tally?.agree || 0,
        disagree: tally?.disagree || 0,
        pass: tally?.pass || 0,
      });
    }
    return json({ results });
  } catch (err) {
    return jsonError("Could not load results: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
