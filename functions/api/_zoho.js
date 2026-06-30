/**
 * Zoho CRM integration — create a Lead via the CRM REST API (OAuth 2.0).
 *
 * GUARDED: if the OAuth secrets aren't set, calls are skipped (no error).
 *
 * Required Cloudflare env secrets to enable CRM:
 *   ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN
 *   ZOHO_ACCOUNTS_HOST — (optional) e.g. https://accounts.zoho.eu  (default .com)
 *   ZOHO_API_HOST      — (optional) e.g. https://www.zohoapis.eu   (default .com)
 *
 * Get the refresh token once via a Zoho "Self Client" in the API console
 * (scope: ZohoCRM.modules.leads.CREATE), then store it as a secret.
 */

async function accessToken(env) {
  const params = new URLSearchParams({
    refresh_token: env.ZOHO_REFRESH_TOKEN,
    client_id: env.ZOHO_CLIENT_ID,
    client_secret: env.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });
  const host = env.ZOHO_ACCOUNTS_HOST || "https://accounts.zoho.com";
  const res = await fetch(`${host}/oauth/v2/token?${params.toString()}`, { method: "POST" });
  const d = await res.json().catch(() => ({}));
  return d.access_token || null;
}

export async function createLead(env, lead) {
  if (!env?.ZOHO_CLIENT_ID || !env?.ZOHO_CLIENT_SECRET || !env?.ZOHO_REFRESH_TOKEN) {
    return { skipped: true, reason: "zoho not configured" };
  }
  try {
    const token = await accessToken(env);
    if (!token) return { ok: false, error: "no access token" };
    const apiHost = env.ZOHO_API_HOST || "https://www.zohoapis.com";
    const res = await fetch(`${apiHost}/crm/v3/Leads`, {
      method: "POST",
      headers: { "Authorization": `Zoho-oauthtoken ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [{
          Last_Name: lead.lastName || lead.email || "Unknown",
          First_Name: lead.firstName || "",
          Email: lead.email || "",
          Phone: lead.phone || "",
          Country: lead.country || "",
          Lead_Source: lead.source || "Humanity-AI Website",
        }],
        trigger: ["workflow"],
      }),
    });
    if (!res.ok) return { ok: false, error: `Zoho CRM ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
