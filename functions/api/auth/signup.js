/**
 * POST /api/auth/signup
 * Register a new user account
 * Body: { email, password, display_name, phone, country, newsletter, contactMe }
 * `crm_opt_in` is an alias of `contactMe`.
 * A Zoho CRM lead is created only when contactMe or crm_opt_in is boolean true.
 * Opening an account is not consent to sales contact.
 */
import { json, jsonError, optionsResponse, hashPassword, generateToken, newId, ensureAuthSchema } from "../_shared.js";
import { sendTemplate } from "../_email.js";
import { createLead } from "../_zoho.js";
import { CONTACT_TEXT, SIGNUP_NEWSLETTER_TEXT, logConsent } from "../_consent.js";

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    await ensureAuthSchema(env);
    const body = await request.json();
    const { email, password, display_name, phone, country, newsletter, contactMe, crm_opt_in } = body;
    const newsletterOptIn = newsletter === true;
    const contactOptIn = contactMe === true || crm_opt_in === true;

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
    const cleanEmail = email.toLowerCase().trim();

    await env.DB.prepare(
      "INSERT INTO users (id, email, password_hash, display_name, role, acl_level, status, phone, country, newsletter) VALUES (?, ?, ?, ?, 'user', 0, 'active', ?, ?, ?)"
    ).bind(userId, cleanEmail, passHash, name, (phone || "").trim() || null, (country || "").trim() || null, newsletterOptIn ? 1 : 0).run();

    // Create session
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)"
    ).bind(newId(), userId, token, expiresAt).run();

    // Best-effort welcome email (no-op until env secrets are set). Not a sales lead.
    try { await sendTemplate(env, "welcome", { to: cleanEmail, toName: name, vars: { name } }); } catch (e) { /* non-critical */ }
    // CRM lead only when the person ticked the separate contact box.
    if (contactOptIn) {
      try {
        await createLead(env, { firstName: name, lastName: name, email: cleanEmail, phone, country, source: "Account signup" });
      } catch (e) { /* non-critical */ }
    }
    if (newsletterOptIn) {
      try { await logConsent(env, { email: cleanEmail, purpose: "newsletter", source: "signup", consentText: SIGNUP_NEWSLETTER_TEXT }); } catch (e) { /* non-critical */ }
    }
    if (contactOptIn) {
      try { await logConsent(env, { email: cleanEmail, purpose: "contact", source: "signup", consentText: CONTACT_TEXT }); } catch (e) { /* non-critical */ }
    }

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
