/**
 * /api/admin/surveys — Surveys manager (admin)
 * GET  — list all surveys with counts; ?id=<id> → one survey with statements + tallies
 * POST — actions: create | update | set_status | delete |
 *                  add_statement | update_statement | delete_statement
 *
 * View requires L1; mutations require L3 (editor). Surveys/statements are
 * structured content; votes stay in survey_votes (source of truth for tallies).
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

async function logAdmin(env, adminId, action, targetId, details) {
  try {
    await env.DB.prepare(
      "INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, details) VALUES (?, ?, ?, 'survey', ?, ?)"
    ).bind(newId(), adminId, action, targetId, details || "").run();
  } catch (e) { /* audit log is best-effort */ }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (id) {
      const survey = await env.DB.prepare(
        `SELECT id, title, intro, description, status, location, slug, settings, sort_order
         FROM surveys WHERE id = ?`
      ).bind(id).first();
      if (!survey) return jsonError("Survey not found.", 404);

      const statements = await env.DB.prepare(
        `SELECT id, text, type, sort_order FROM survey_statements
         WHERE survey_id = ? ORDER BY sort_order ASC, created_at ASC`
      ).bind(id).all();

      const withTallies = [];
      for (const s of statements.results || []) {
        const t = await env.DB.prepare(
          `SELECT
             SUM(CASE WHEN value='agree' THEN 1 ELSE 0 END) AS agree,
             SUM(CASE WHEN value='disagree' THEN 1 ELSE 0 END) AS disagree,
             SUM(CASE WHEN value='pass' THEN 1 ELSE 0 END) AS pass
           FROM survey_votes WHERE statement_id = ?`
        ).bind(s.id).first();
        withTallies.push({ ...s, agree: t?.agree || 0, disagree: t?.disagree || 0, pass: t?.pass || 0 });
      }
      return json({ survey: { ...survey, statements: withTallies } });
    }

    const surveys = await env.DB.prepare(
      `SELECT s.id, s.title, s.intro, s.status, s.location, s.created_at,
              (SELECT COUNT(*) FROM survey_statements ss WHERE ss.survey_id = s.id) AS statement_count,
              (SELECT COUNT(DISTINCT v.voter) FROM survey_votes v WHERE v.survey_id = s.id) AS respondent_count
       FROM surveys s ORDER BY s.sort_order ASC, s.created_at DESC`
    ).all();
    return json({ surveys: surveys.results || [] });
  } catch (err) {
    return jsonError("Failed to list surveys: " + err.message);
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
      case "create": {
        const slug = (body.slug || "").trim();
        const id = slug || "survey-" + newId().slice(0, 8);
        await env.DB.prepare(
          `INSERT INTO surveys (id, title, intro, description, status, location, slug)
           VALUES (?,?,?,?,?,?,?)`
        ).bind(
          id, body.title || "Untitled survey", body.intro || "", body.description || "",
          body.status || "draft", body.location || "surveys_page", slug || null
        ).run();
        await logAdmin(env, user.id, "create", id, `Created survey "${body.title || id}"`);
        return json({ success: true, id });
      }
      case "update": {
        if (!body.id) return jsonError("id required.");
        await env.DB.prepare(
          `UPDATE surveys SET title=?, intro=?, description=?, status=?, location=? WHERE id=?`
        ).bind(
          body.title || "", body.intro || "", body.description || "",
          body.status || "draft", body.location || "surveys_page", body.id
        ).run();
        await logAdmin(env, user.id, "update", body.id, "Updated survey details");
        return json({ success: true });
      }
      case "set_status": {
        if (!body.id || !body.status) return jsonError("id and status required.");
        await env.DB.prepare(`UPDATE surveys SET status=? WHERE id=?`).bind(body.status, body.id).run();
        await logAdmin(env, user.id, "set_status", body.id, `Status → ${body.status}`);
        return json({ success: true });
      }
      case "delete": {
        if (!body.id) return jsonError("id required.");
        await env.DB.prepare(`DELETE FROM survey_votes WHERE survey_id=?`).bind(body.id).run();
        await env.DB.prepare(`DELETE FROM survey_statements WHERE survey_id=?`).bind(body.id).run();
        await env.DB.prepare(`DELETE FROM surveys WHERE id=?`).bind(body.id).run();
        await logAdmin(env, user.id, "delete", body.id, "Deleted survey + statements + votes");
        return json({ success: true });
      }
      case "add_statement": {
        if (!body.survey_id || !body.text) return jsonError("survey_id and text required.");
        const sid = newId();
        const order = parseInt(body.sort_order) || 0;
        await env.DB.prepare(
          `INSERT INTO survey_statements (id, survey_id, text, author, type, sort_order)
           VALUES (?,?,?,NULL,?,?)`
        ).bind(sid, body.survey_id, body.text, body.type || "vote", order).run();
        return json({ success: true, id: sid });
      }
      case "update_statement": {
        if (!body.statement_id) return jsonError("statement_id required.");
        await env.DB.prepare(`UPDATE survey_statements SET text=?, type=? WHERE id=?`)
          .bind(body.text || "", body.type || "vote", body.statement_id).run();
        return json({ success: true });
      }
      case "delete_statement": {
        if (!body.statement_id) return jsonError("statement_id required.");
        await env.DB.prepare(`DELETE FROM survey_votes WHERE statement_id=?`).bind(body.statement_id).run();
        await env.DB.prepare(`DELETE FROM survey_statements WHERE id=?`).bind(body.statement_id).run();
        return json({ success: true });
      }
      default:
        return jsonError("Invalid action.");
    }
  } catch (err) {
    return jsonError("Survey action failed: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
