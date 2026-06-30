/**
 * /api/admin/segments — build a mailing segment from member filters (UC25).
 * GET — filtered list of members; ?format=csv → export the segment.
 *
 * Filters (query params): country, side (human|developer), account=1,
 * newsletter=1, founding=1.
 * Sources: signatures UNION users, deduped by email. Requires L2.
 */
import { json, jsonError, optionsResponse, getUser, requireACL, CORS_HEADERS } from "../_shared.js";
import { ensureMovementSchema } from "../_movement.js";

const csvCell = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

function buildQuery(url) {
  const where = ["1=1"];
  const having = [];
  const args = [];
  const country = (url.searchParams.get("country") || "").trim();
  const side = (url.searchParams.get("side") || "").trim();
  if (country) { where.push("m.country LIKE ?"); args.push(`%${country}%`); }
  if (side === "human" || side === "developer") { where.push("m.side = ?"); args.push(side); }
  if (url.searchParams.get("newsletter") === "1") having.push("MAX(m.newsletter) = 1");
  if (url.searchParams.get("account") === "1") having.push("MAX(m.has_account) = 1");
  const foundingJoin = url.searchParams.get("founding") === "1" ? "AND mm.is_founding = 1" : "";
  const sql =
    `SELECT m.email, MAX(m.name) AS name, MAX(m.country) AS country, MAX(m.phone) AS phone,
            MAX(m.newsletter) AS newsletter, MAX(m.has_account) AS has_account, MAX(m.side) AS side,
            MAX(COALESCE(mm.is_founding,0)) AS is_founding
     FROM (
       SELECT email, name, country, NULL AS phone, COALESCE(newsletter,0) AS newsletter, side, 0 AS has_account FROM signatures
       UNION ALL
       SELECT email, display_name AS name, country, phone, COALESCE(newsletter,0) AS newsletter, NULL AS side, 1 AS has_account FROM users
     ) m
     LEFT JOIN member_membership mm ON mm.member_email = m.email ${foundingJoin}
     WHERE ${where.join(" AND ")}
     GROUP BY m.email
     ${having.length ? "HAVING " + having.join(" AND ") : ""}
     ORDER BY name ASC`;
  return { sql, args };
}

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    // member_membership lives in admin/members.js schema; create defensively.
    try { await env.DB.prepare(`CREATE TABLE IF NOT EXISTS member_membership (member_email TEXT PRIMARY KEY, monthly_pledge TEXT, is_founding INTEGER DEFAULT 0, status TEXT, updated_at DATETIME)`).run(); } catch (e) {}

    const user = await getUser(request, env);
    const aclError = requireACL(user, 2);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const { sql, args } = buildQuery(url);
    const rows = (await env.DB.prepare(sql).bind(...args).all().catch(() => ({ results: [] }))).results || [];

    if (url.searchParams.get("format") === "csv") {
      const header = "Name,Email,Country,Phone,Newsletter,Account,Side\n";
      const body = rows.map(r =>
        [r.name, r.email, r.country, r.phone, r.newsletter ? "yes" : "no", r.has_account ? "yes" : "no", r.side || ""].map(csvCell).join(",")
      ).join("\n");
      return new Response(header + body, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="segment-${new Date().toISOString().slice(0, 10)}.csv"`,
          ...CORS_HEADERS,
        },
      });
    }

    return json({ members: rows, total: rows.length });
  } catch (err) {
    return jsonError("Failed to build segment: " + err.message);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
