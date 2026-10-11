/**
 * /api/config
 * GET — Public, non-secret settings the browser needs (e.g. the Turnstile site key).
 */
import { json, optionsResponse } from "./_shared.js";

export async function onRequestGet(context) {
  const { env } = context;
  return json({ turnstileSiteKey: env.TURNSTILE_SITE_KEY || null });
}

export async function onRequestOptions() {
  return optionsResponse();
}
