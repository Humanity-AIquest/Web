/**
 * /api/quests
 * GET  — Public list of open quests.
 * POST — Admin only (ACL editor+): create a quest.
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

export async function onRequestGet(context) {
  const { env } = context;
  try {
    await ensureMovementSchema(env);
    const rows = await env.DB.prepare(
      `SELECT id, title, bounty, status, summary, tags FROM quests WHERE status = 'Open' ORDER BY created_at DESC`
    ).all();
    const quests = (rows.results || []).map(q => ({
      ...q,
      tags: safeTags(q.tags),
    }));
    return json({ quests });
  } catch (err) {
    return jsonError("Could not load quests: " + err.message);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const denied = requireACL(user, 3); // editor+
    if (denied) return denied;

    const { id, title, bounty, summary, problem, tags } = await request.json();
    if (!title) return jsonError("A quest needs a title.");
    const slug = (id || title).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

    await env.DB.prepare(
      `INSERT INTO quests (id, title, bounty, status, summary, problem, tags) VALUES (?,?,?,'Open',?,?,?)`
    ).bind(slug, title.trim(), bounty || null, summary || null, problem || null,
      JSON.stringify(Array.isArray(tags) ? tags : [])).run();

    return json({ success: true, id: slug });
  } catch (err) {
    return jsonError("Could not create quest: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}

function safeTags(t) {
  try { const a = JSON.parse(t); return Array.isArray(a) ? a : []; } catch { return []; }
}
