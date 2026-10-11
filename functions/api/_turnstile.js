/**
 * Cloudflare Turnstile ("I am human") verification.
 *
 * Enforced only when the TURNSTILE_SECRET_KEY secret is set on the Cloudflare
 * project, so forms keep working before the key is configured. If Cloudflare's
 * verify endpoint is unreachable we let the request through rather than lose a
 * real signup; a missing or rejected token is refused.
 */
export const TURNSTILE_FAIL = "Please complete the “I am human” check and try again.";

export async function verifyTurnstile(env, request, token) {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false };

  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  const ip = request.headers.get("CF-Connecting-IP");
  if (ip) form.append("remoteip", ip);

  try {
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const d = await r.json();
    return { ok: !!d.success, codes: d["error-codes"] || [] };
  } catch (e) {
    return { ok: true, skipped: true };
  }
}
