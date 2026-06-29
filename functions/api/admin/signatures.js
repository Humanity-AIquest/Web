/**
 * /api/admin/signatures — Petition signatures manager (admin)
 * GET  — list signatures (search ?q=, paginate ?page=); ?format=csv → CSV export
 * POST — action: delete { id }
 *
 * View requires L1; delete requires L4 (destructive, like banning).
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId, CORS_HEADERS } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const q = (url.searchParams.get("q") || "").trim();
    const format = url.searchParams.get("format");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = 50;
    const offset = (page - 1) * limit;

    const where = q ? "WHERE name LIKE ? OR email LIKE ? OR country LIKE ?" : "";
    const likeArgs = q ? [`%${q}%`, `%${q}%`, `%${q}%`] : [];

    // CSV export — all matching rows, no pagination.
    if (format === "csv") {
      const all = await env.DB.prepare(
        `SELECT name, email, side, country, created_at FROM signatures ${where} ORDER BY created_at ASC`
      ).bind(...likeArgs).all();
      const header = "Name,Email,Side,Country,Signed At\n";
      const body = (all.results || []).map(r =>
        [r.name, r.email, r.side, r.country, r.created_at].map(csvCell).join(",")
      ).join("\n");
      return new Response(header + body, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="signatures-${new Date().toISOString().slice(0, 10)}.csv"`,
          ...CORS_HEADERS,
        },
      });
    }

    const rows = await env.DB.prepare(
      `SELECT id, name, email, side, country, created_at FROM signatures ${where}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`
    ).bind(...likeArgs, limit, offset).all();
    const total = (await env.DB.prepare(`SELECT COUNT(*) AS n FROM signatures ${where}`).bind(...likeArgs).first())?.n || 0;

    return json({ signatures: rows.results || [], total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    return jsonError("Failed to list signatures: " + err.message);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const user = await getUser(request, env);
    const aclError = requireACL(user, 4);
    if (aclError) return aclError;

    const { action, id } = await request.json();
    if (action !== "delete" || !id) return jsonError("Invalid action. Use: delete { id }.");

    await env.DB.prepare("DELETE FROM signatures WHERE id = ?").bind(id).run();
    try {
      await env.DB.prepare(
        "INSERT INTO admin_actions (id, admin_id, action_type, target_type, target_id, details) VALUES (?, ?, 'delete', 'signature', ?, 'Deleted signature')"
      ).bind(newId(), user.id, id).run();
    } catch (e) { /* audit best-effort */ }

    return json({ success: true });
  } catch (err) {
    return jsonError("Failed to delete signature: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
