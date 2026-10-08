/**
 * Consent record for newsletter and contact opt-ins.
 *
 * Checkbox strings here are the text the UI must show. The server logs these
 * canonical strings (not client-supplied text) so the record cannot be forged.
 * Keep them identical to the labels in src/App.jsx.
 *
 * Operator name: the public brand is "Humanity-AI". That is not yet a legal
 * entity. Antony decides whether notices name a responsible person or the
 * entity once it exists (D25). Do not invent a legal name here.
 */
import { newId } from "./_shared.js";

export const SIGNUP_NEWSLETTER_TEXT = "Keep me updated by email about the movement";
export const PETITION_NEWSLETTER_TEXT = "Email me updates about the movement";
export const CONTACT_TEXT = "Contact me about volunteering, events and the Humanity-AI project";

export async function ensureConsentSchema(env) {
  if (!env?.DB) return;
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS consent_log (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    purpose TEXT NOT NULL,
    source TEXT NOT NULL,
    consent_text TEXT NOT NULL,
    consented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    withdrawn_at DATETIME
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS newsletter_tokens (
    email TEXT PRIMARY KEY,
    token TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`).run();
  try { await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_consent_email ON consent_log(email)").run(); } catch (e) { /* exists */ }
}

/** Append a consent row. Best-effort: callers decide whether to swallow errors. */
export async function logConsent(env, { email, purpose, source, consentText }) {
  if (!env?.DB || !email || !consentText) return;
  await ensureConsentSchema(env);
  await env.DB.prepare(
    "INSERT INTO consent_log (id, email, purpose, source, consent_text) VALUES (?,?,?,?,?)"
  ).bind(newId(), String(email).trim().toLowerCase(), purpose, source, consentText).run();
}

export async function logNewsletterWithdrawal(env, email) {
  if (!env?.DB || !email) return;
  await ensureConsentSchema(env);
  const clean = String(email).trim().toLowerCase();
  // Stamp the original opt-in rows. A new withdrawal row alone would leave them
  // with withdrawn_at NULL, so the 3-year purge would never delete them.
  await env.DB.prepare(
    `UPDATE consent_log SET withdrawn_at = datetime('now')
     WHERE email = ? AND purpose = 'newsletter' AND withdrawn_at IS NULL`
  ).bind(clean).run();
  await env.DB.prepare(
    `INSERT INTO consent_log (id, email, purpose, source, consent_text, withdrawn_at)
     VALUES (?,?,?,?,?,datetime('now'))`
  ).bind(newId(), clean, "newsletter", "unsubscribe", "Unsubscribe link in email").run();
}

/** Stable per-email token so every outbound message can carry an unsubscribe link. */
export async function unsubscribeToken(env, email) {
  if (!env?.DB || !email) return null;
  await ensureConsentSchema(env);
  const clean = String(email).trim().toLowerCase();
  const existing = await env.DB.prepare("SELECT token FROM newsletter_tokens WHERE email = ?").bind(clean).first();
  if (existing?.token) return existing.token;
  const token = newId() + newId();
  await env.DB.prepare("INSERT INTO newsletter_tokens (email, token) VALUES (?, ?)").bind(clean, token).run();
  return token;
}

export async function emailForUnsubscribeToken(env, token) {
  if (!env?.DB || !token) return null;
  await ensureConsentSchema(env);
  const row = await env.DB.prepare("SELECT email FROM newsletter_tokens WHERE token = ?").bind(String(token)).first();
  return row?.email || null;
}

/**
 * Absolute origin for links inside email. Staging should set PUBLIC_ORIGIN
 * (or SITE_URL) to its own host. The production default is only a fallback.
 */
export function publicOrigin(env) {
  const raw = env?.PUBLIC_ORIGIN || env?.SITE_URL || "https://humanity-ai.quest";
  return String(raw).replace(/\/$/, "");
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

/** Israel Communications Law s.30A: an advertising subject must start with this word. */
export const ADVERTISING_SUBJECT_PREFIX = "פרסומת";

export function advertisingSubject(subject) {
  const s = String(subject || "").replace(/^\s+/, "");
  if (s.startsWith(ADVERTISING_SUBJECT_PREFIX)) return s;
  return s ? `${ADVERTISING_SUBJECT_PREFIX} ${s}` : ADVERTISING_SUBJECT_PREFIX;
}

/**
 * Sender name, contact address, and reply-to-refuse. Applied by sendTemplate
 * whenever advertising is true, so a caller cannot skip it.
 * Name stays the public brand until Antony names the legal operator (D25).
 */
export function advertisingIdentityHtml({ senderName, contactAddress }) {
  const name = senderName || "Humanity-AI";
  const contact = contactAddress || "hrc@humanity-ai.quest";
  return `<p data-s30a="1" style="margin-top:16px;font-size:12px;line-height:1.5;color:#666">Sender: ${esc(name)}. Contact: ${esc(contact)}. To refuse, reply to this email and write unsubscribe.<br><span dir="rtl" lang="he">שולח: ${esc(name)}. ליצירת קשר: ${esc(contact)}. לסירוב, השיבו למייל זה וכתבו unsubscribe.</span></p>`;
}

/**
 * Drop consent_log rows withdrawn more than 3 years ago. Live rows stay until
 * logNewsletterWithdrawal stamps them. There is no scheduler; call this from
 * withdrawal and admin-deletion paths, and from any future job.
 */
export async function purgeExpiredConsentLog(env) {
  if (!env?.DB) return { purged: 0 };
  await ensureConsentSchema(env);
  const result = await env.DB.prepare(
    `DELETE FROM consent_log
     WHERE withdrawn_at IS NOT NULL
       AND withdrawn_at <= datetime('now', '-3 years')`
  ).run();
  return { purged: result?.meta?.changes ?? null };
}

/**
 * Footer for every outbound message.
 * Pass advertising=true for newsletter, donation, or other promo mail
 * (Israel Communications Law s.30A). Transactional thank-you and welcome
 * mail stay advertising=false but still include the unsubscribe link.
 */
export function complianceFooter({ unsubscribeUrl, advertising }) {
  const link = unsubscribeUrl
    ? `<a href="${esc(unsubscribeUrl)}">Unsubscribe</a>`
    : "To stop email updates, write to hrc@humanity-ai.quest";
  const ad = advertising
    ? "This message is advertising, including donation or project news, under Israel's Communications Law. "
    : "";
  return `<p style="margin-top:24px;font-size:12px;line-height:1.5;color:#666">${ad}${link}.</p>`;
}
