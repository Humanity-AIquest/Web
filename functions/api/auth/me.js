/**
 * GET /api/auth/me
 * Returns current user info (if logged in)
 * Also returns user's submitted ideas with status
 */
import { json, jsonError, optionsResponse, getUser } from "../_shared.js";

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    const user = await getUser(request, env);
    if (!user) {
      return json({ authenticated: false });
    }

    // Get user's ideas with latest status
    const ideas = await env.DB.prepare(
      `SELECT i.id, i.title, i.status, i.clause_refs, i.created_at,
              (SELECT isl.comment FROM idea_status_log isl
               WHERE isl.idea_id = i.id AND isl.visible_to_user = 1
               ORDER BY isl.created_at DESC LIMIT 1) as latest_comment,
              (SELECT isl.created_at FROM idea_status_log isl
               WHERE isl.idea_id = i.id
               ORDER BY isl.created_at DESC LIMIT 1) as last_updated
       FROM ideas i WHERE i.user_id = ? ORDER BY i.created_at DESC LIMIT 50`
    ).bind(user.id).all();

    return json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        acl_level: user.acl_level,
      },
      ideas: ideas.results || [],
    });
  } catch (err) {
    return jsonError("Failed to get user info.");
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
