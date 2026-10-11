/**
 * POST /api/auth/exists
 * Body: { email } → { exists }
 * Lets the two-step sign-up send returning members straight to "Welcome back".
 */
import { json, jsonError, optionsResponse, ensureAuthSchema } from "../_shared.js";

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    await ensureAuthSchema(env);
    const { email } = await request.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Please enter a valid email address.");
    const row = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email.toLowerCase().trim()).first();
    return json({ exists: !!row });
  } catch (err) {
    return jsonError("Could not check email: " + err.message);
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
