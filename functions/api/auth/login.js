/**
 * POST /api/auth/login
 * Login with email + password, returns session token
 * Body: { email, password }
 */
import { json, jsonError, optionsResponse, verifyPassword, generateToken, newId } from "../_shared.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return jsonError("Email and password are required.");
    }

    // Find user
    const user = await env.DB.prepare(
      "SELECT id, email, password_hash, display_name, role, acl_level, status FROM users WHERE email = ?"
    ).bind(email.toLowerCase().trim()).first();

    if (!user) {
      return jsonError("Invalid email or password.");
    }

    if (user.status === "banned") {
      return jsonError("This account has been suspended. Please contact support.");
    }

    // Check password (skip for seed admin that hasn't set password yet)
    if (user.password_hash === "CHANGE_ON_FIRST_LOGIN") {
      return jsonError("This account requires a password reset. Please contact the Super Admin.");
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return jsonError("Invalid email or password.");
    }

    // Clean up old sessions for this user (keep max 5)
    await env.DB.prepare(
      "DELETE FROM sessions WHERE user_id = ? AND id NOT IN (SELECT id FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 4)"
    ).bind(user.id, user.id).run();

    // Create new session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(newId(), user.id, token, expiresAt).run();

    return json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        role: user.role,
        acl_level: user.acl_level,
      },
      token: token,
    });
  } catch (err) {
    return jsonError("Login failed. Please try again.");
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
