/**
 * POST /api/auth/signup
 * Register a new user account
 * Body: { email, password, display_name }
 */
import { json, jsonError, optionsResponse, hashPassword, generateToken, newId } from "../_shared.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password, display_name } = body;

    // Validate
    if (!email || !password) {
      return jsonError("Email and password are required.");
    }
    if (password.length < 8) {
      return jsonError("Password must be at least 8 characters.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return jsonError("Please provide a valid email address.");
    }

    // Check if email already exists
    const existing = await env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email.toLowerCase().trim()).first();

    if (existing) {
      return jsonError("An account with this email already exists. Please log in.");
    }

    // Create user
    const userId = newId();
    const passHash = await hashPassword(password);
    const name = (display_name || email.split("@")[0]).trim().slice(0, 50);

    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, display_name, role, acl_level, status) VALUES (?, ?, ?, ?, 'user', 0, 'active')"
    ).bind(userId, email.toLowerCase().trim(), passHash, name).run();

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(newId(), userId, token, expiresAt).run();

    return json({
      success: true,
      user: { id: userId, email: email.toLowerCase().trim(), display_name: name, role: "user", acl_level: 0 },
      token: token,
    });
  } catch (err) {
    return jsonError("Registration failed. Please try again.");
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
