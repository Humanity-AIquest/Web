/**
 * /api/admin/audit — admin audit-log viewer (UC30).
 * GET — recent admin_actions (who did what, when), newest first.
 * Restricted to L4+ (managers / super admin) since it's oversight data.
 */
import { json, jsonError, optionsResponse, getUser, requireACL } from "../_shared.js";

async function ensure(env) {
  // admin_actions is written by several endpoints but was never created in code.
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_actions (
    id TEXT PRIMARY KEY,
    admin_id TEXT,
    action_type TEXT,
    target_type TEXT,
    target_id TEXT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await ensure(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 4);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 60;
    const offset = (page - 1) * limit;

    const rows = await env.DB.prepare(
      `SELECT a.id, a.action_type, a.target_type, a.target_id, a.details, a.created_at,
              u.display_name AS admin_name, u.email AS admin_email
       FROM admin_actions a LEFT JOIN users u ON a.admin_id = u.id
       ORDER BY a.created_at DESC LIMIT ? OFFSET ?`
    ).bind(limit, offset).all().catch(() => ({ results: [] }));

    const total = (await env.DB.prepare("SELECT COUNT(*) AS n FROM admin_actions").first().catch(() => null))?.n || 0;
    return json({ actions: rows.results || [], total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return jsonError("Failed to load audit log: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
