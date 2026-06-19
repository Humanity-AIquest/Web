/**
 * /api/surveys/:id/vote
 * POST — Record a vote. Body: { statementId, value } where value ∈ agree|disagree|pass.
 * One vote per statement per visitor, enforced by an anonymous cookie token.
 */
import { jsonError, optionsResponse, newId, generateToken, CORS_HEADERS } from "../../_shared.js";
import { ensureMovementSchema } from "../../_movement.js";

function readVoter(request) {
  const cookie = request.headers.get("Cookie") || "";
  const m = cookie.match(/hai_voter=([a-f0-9]+)/);
  return m ? m[1] : null;
}

function jsonWithCookie(data, voter, setCookie) {
  const headers = { "Content-Type": "application/json", ...CORS_HEADERS };
  if (setCookie) {
    headers["Set-Cookie"] = `hai_voter=${voter}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }
  return new Response(JSON.stringify(data), { status: 200, headers });
}

export async function onRequestPost(context) {
  const { request, env, params } = context;
  try {
    await ensureMovementSchema(env);
    const { statementId, value } = await request.json();
    if (!["agree", "disagree", "pass"].includes(value)) return jsonError("Invalid vote value.");

    const stmt = await env.DB.prepare(
      "SELECT id FROM survey_statements WHERE id = ? AND survey_id = ?"
    ).bind(statementId, params.id).first();
    if (!stmt) return jsonError("Statement not found.", 404);

    let voter = readVoter(request);
    const isNew = !voter;
    if (!voter) voter = generateToken();

    // Upsert: one row per (statement, voter)
    await env.DB.prepare(
      `INSERT INTO survey_votes (id, survey_id, statement_id, value, voter)
       VALUES (?,?,?,?,?)
       ON CONFLICT(statement_id, voter) DO UPDATE SET value = excluded.value`
    ).bind(newId(), params.id, statementId, value, voter).run();

    return jsonWithCookie({ success: true }, voter, isNew);
  } catch (err) {
    return jsonError("Could not record your vote: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
