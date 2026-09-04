/**
 * POST /api/auth/signup
 * Register a new user account
 * Body: { email, password, display_name, phone, country, newsletter }
 */
import { json, jsonError, optionsResponse, hashPassword, generateToken, newId } from "../_shared.js";
import { sendTemplate } from "../_email.js";
import { createLead } from "../_zoho.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { email, password, display_name, phone, country, newsletter } = body;

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

    // Self-migrate: member fields collected at signup.
    for (const col of ["phone TEXT", "country TEXT", "newsletter INTEGER DEFAULT 0"]) {
      try { await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${col}`).run(); } catch (e) { /* exists */ }
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
    const cleanEmail = email.toLowerCase().trim();

    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, display_name, role, acl_level, status, phone, country, newsletter) VALUES (?, ?, ?, ?, 'user', 0, 'active', ?, ?, ?)"
    ).bind(userId, cleanEmail, passHash, name, (phone || "").trim() || null, (country || "").trim() || null, newsletter ? 1 : 0).run();

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(newId(), userId, token, expiresAt).run();

    // Best-effort: welcome email + CRM lead (both no-op until env secrets are set).
    try { await sendTemplate(env, "welcome", { to: cleanEmail, toName: name, vars: { name } }); } catch (e) { /* non-critical */ }
    try {
      await createLead(env, { firstName: name, lastName: name, email: cleanEmail, phone, country, source: "Account signup" });
    } catch (e) { /* non-critical */ }

    return json({
      success: true,
      user: { id: userId, email: cleanEmail, display_name: name, role: "user", acl_level: 0 },
      token: token,
    });
  } catch (err) {
    return jsonError("Registration failed. Please try again.");
  }
}

export async function onRequestOptions() {
  return optionsResponse();
}
