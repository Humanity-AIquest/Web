/**
 * /api/admin/agenti
 * GET — Return the Agenti admin shell URL for the admin console's Agenti tab.
 *       The URL lives in the Cloudflare environment variable AGENTI_ADMIN_URL so it is
 *       never in the public repo or the public JS bundle; only admins (ACL 1+) receive it.
 */
import { json, jsonError, optionsResponse, getUser, requireACL } from "../_shared.js";

export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    return json({ url: env.AGENTI_ADMIN_URL || null });
  } catch (err) {
    return jsonError(err.message || "Failed to load the Agenti URL", 500);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
