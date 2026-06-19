/**
 * /api/sign
 * POST — Add a signature to the Founding Memo. Body: { name, email, side, country }
 * Returns { success, number, count } where number = this signatory's position.
 */
import { json, jsonError, optionsResponse, newId } from "./_shared.js";
import { ensureMovementSchema } from "./_movement.js";

const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e || "");

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureMovementSchema(env);
    const { name, email, side, country } = await request.json();

    if (!name || name.trim().length < 2) return jsonError("Please add your name.");
    if (!validEmail(email)) return jsonError("Please add a valid email.");

    const cleanSide = side === "developer" ? "developer" : "human";

    // One signature per email — return existing position if already signed.
    const existing = await env.DB.prepare(
      "SELECT id FROM signatures WHERE email = ?"
    ).bind(email.trim().toLowerCase()).first();

    if (!existing) {
      await env.DB.prepare(
        "INSERT INTO signatures (id, name, email, side, country) VALUES (?,?,?,?,?)"
      ).bind(newId(), name.trim(), email.trim().toLowerCase(), cleanSide, country || null).run();
    }

    const count = (await env.DB.prepare("SELECT COUNT(*) AS n FROM signatures").first())?.n || 0;
    // Position = rowid order of this email
    const pos = await env.DB.prepare(
      "SELECT COUNT(*) AS n FROM signatures WHERE created_at <= (SELECT created_at FROM signatures WHERE email = ?)"
    ).bind(email.trim().toLowerCase()).first();

    return json({ success: true, number: pos?.n || count, count });
  } catch (err) {
    return jsonError("Could not record your signature: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
