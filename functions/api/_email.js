/**
 * Transactional email via Zoho ZeptoMail (HTTP API — Cloudflare Workers can't
 * open raw SMTP sockets, so SMTP to Zoho Mail is NOT possible from here).
 *
 * Everything is GUARDED: if the env secrets aren't set, sends are skipped (no
 * error), so the app keeps working until you provision ZeptoMail.
 *
 * Required Cloudflare env secrets to enable sending:
 *   ZEPTOMAIL_TOKEN   — ZeptoMail "Send Mail" API token (Zoho-enczapikey ...)
 *   EMAIL_FROM        — a verified sender address on your ZeptoMail domain
 *   EMAIL_FROM_NAME   — (optional) display name, defaults to "Humanity-AI"
 *   ZEPTOMAIL_API_URL — (optional) region endpoint, defaults to .com
 *
 * Admin-editable templates live in the email_templates table (D1), so personalised
 * template copy can be managed without code changes.
 *
 * Every send gets an unsubscribe link (see complianceFooter in _consent.js).
 * Newsletter, donation, and other promo sends must pass advertising: true.
 * sendTemplate then starts the subject with פרסומת and adds the sender name,
 * contact address, and a reply-to-refuse line.
 * No advertising mail goes out until ALLOW_ADVERTISING_EMAIL=1. Leave that unset
 * until Antony names the legal operator (D25): then set EMAIL_FROM_NAME to that
 * legal name and use the operator's contact address as EMAIL_FROM.
 */
import { advertisingIdentityHtml, advertisingSubject, complianceFooter, publicOrigin, unsubscribeToken } from "./_consent.js";

export async function ensureEmailSchema(env) {
  if (!env?.DB) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS email_templates (
    key TEXT PRIMARY KEY,
    subject TEXT NOT NULL,
    html TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  // Seed defaults once.
  const n = await env.DB.prepare("SELECT COUNT(*) AS n FROM email_templates").first();
  if ((n?.n || 0) === 0) {
    const seed = [
      ["welcome", "Welcome to Humanity-AI",
        "<p>Hi {{name}},</p><p>Welcome to Humanity-AI — thank you for creating an account. You can now submit ideas and help shape humanity's constitution for AI.</p><p>— The Humanity-AI team</p>"],
      ["signature_thanks", "Thank you for signing",
        "<p>Hi {{name}},</p><p>Thank you for signing the Humanity-AI petition. Your voice is now part of the movement.</p><p>— The Humanity-AI team</p>"],
    ];
    for (const [key, subject, html] of seed) {
      try { await env.DB.prepare("INSERT INTO email_templates (key, subject, html) VALUES (?,?,?)").bind(key, subject, html).run(); } catch (e) { /* exists */ }
    }
  }
}

function fill(str, vars) {
  return String(str || "").replace(/\{\{(\w+)\}\}/g, (_, k) => (vars && vars[k] != null ? String(vars[k]) : ""));
}

export async function sendEmail(env, { to, toName, subject, html }) {
  const token = env?.ZEPTOMAIL_TOKEN;
  const from = env?.EMAIL_FROM;
  if (!token || !from || !to) return { skipped: true, reason: "email not configured" };
  const url = env.ZEPTOMAIL_API_URL || "https://api.zeptomail.com/v1.1/email";
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-enczapikey ${token}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        from: { address: from, name: env.EMAIL_FROM_NAME || "Humanity-AI" },
        to: [{ email_address: { address: to, name: toName || to } }],
        subject,
        htmlbody: html,
      }),
    });
    if (!res.ok) return { ok: false, error: `ZeptoMail ${res.status}` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// Send a managed template by key with {{variable}} substitution.
// advertising: true marks donation/promo/newsletter mail (Communications Law s.30A).
export async function sendTemplate(env, key, { to, toName, vars, advertising = false }) {
  try {
    // Tied to the legal-operator decision (D25). The public brand is not that name.
    // Do not set ALLOW_ADVERTISING_EMAIL until EMAIL_FROM_NAME is the legal name
    // and EMAIL_FROM is the operator's contact address in this footer.
    if (advertising && env?.ALLOW_ADVERTISING_EMAIL !== "1") {
      return { skipped: true, reason: "advertising sends are off until the legal operator is named" };
    }
    await ensureEmailSchema(env);
    const t = await env.DB.prepare("SELECT subject, html FROM email_templates WHERE key = ?").bind(key).first();
    if (!t) return { skipped: true, reason: "template missing" };
    let subject = fill(t.subject, vars);
    let html = fill(t.html, vars);
    if (!html.includes("/api/unsubscribe")) {
      let unsubscribeUrl = "";
      try {
        const token = await unsubscribeToken(env, to);
        if (token) unsubscribeUrl = `${publicOrigin(env)}/api/unsubscribe?token=${encodeURIComponent(token)}`;
      } catch (e) { /* link falls back to the hrc@ address inside the footer */ }
      html += complianceFooter({ unsubscribeUrl, advertising });
    }
    // s.30A is enforced here, not left to the caller: advertising subjects start
    // with פרסומת, and the body names the sender, a contact address, and reply-to-refuse.
    if (advertising) {
      subject = advertisingSubject(subject);
      if (!html.includes('data-s30a="1"')) {
        html += advertisingIdentityHtml({
          senderName: env?.EMAIL_FROM_NAME || "Humanity-AI",
          contactAddress: env?.EMAIL_FROM || "hrc@humanity-ai.quest",
        });
      }
    }
    return await sendEmail(env, { to, toName, subject, html });
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
