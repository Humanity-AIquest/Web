/**
 * /api/unsubscribe?token=
 * GET  — confirm page only. Email scanners that fetch the link must not opt anyone out.
 * POST — stop newsletter mail for the address behind this token.
 * Does not delete a petition signature. Signature deletion stays a request to
 * hrc@humanity-ai.quest, carried out by an admin delete (which purges the
 * interactions index). A Zoho CRM lead, if one was created, is a manual step
 * in the withdrawal runbook (SCHEMA.md).
 */
import { optionsResponse, ensureAuthSchema } from "./_shared.js";
import { ensureMovementSchema } from "./_movement.js";
import { emailForUnsubscribeToken, logNewsletterWithdrawal, purgeExpiredConsentLog } from "./_consent.js";

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function page(title, body) {
  return new Response(`<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<body style="margin:0;font-family:system-ui,sans-serif;background:#0F1F3A;color:#F2EAD3;padding:48px 20px">
<main style="max-width:36rem;margin:0 auto;line-height:1.5">
${body}
</main>
</body>
</html>`, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

async function readToken(request) {
  const url = new URL(request.url);
  let token = url.searchParams.get("token") || "";
  if (token || request.method !== "POST") return token;
  const ctype = request.headers.get("content-type") || "";
  if (ctype.includes("application/json")) {
    const body = await request.json().catch(() => ({}));
    return body.token || "";
  }
  const form = await request.formData().catch(() => null);
  return form?.get("token") || "";
}

function invalidPage() {
  return page("Link not valid", `
    <h1 style="font-weight:500">This unsubscribe link is not valid.</h1>
    <p>To stop email updates, write to <a href="mailto:hrc@humanity-ai.quest" style="color:#5BE9DD">hrc@humanity-ai.quest</a>.</p>
    <p dir="rtl" lang="he">הקישור אינו תקף. כדי להפסיק עדכונים בדוא״ל, כתוב אל hrc@humanity-ai.quest.</p>`);
}

function confirmPage(token) {
  return page("Confirm unsubscribe", `
    <h1 style="font-weight:500">Stop email updates?</h1>
    <p>This page does not change anything until you confirm. A petition signature, if you left one, is not deleted.</p>
    <form method="POST" action="/api/unsubscribe">
      <input type="hidden" name="token" value="${esc(token)}">
      <button type="submit" style="margin-top:12px;padding:12px 18px;border:0;border-radius:999px;background:#5BE9DD;color:#0F1F3A;font-weight:600;cursor:pointer">Confirm unsubscribe</button>
    </form>
    <p dir="rtl" lang="he">הדף הזה אינו משנה דבר עד האישור. חתימה על העצומה, אם נמסרה, אינה נמחקת.</p>`);
}

async function performUnsubscribe(env, token) {
  const email = await emailForUnsubscribeToken(env, token);
  if (!email) return invalidPage();

  try { await ensureMovementSchema(env); } catch (e) { /* signatures table may be absent in a bare test */ }
  try { await ensureAuthSchema(env); } catch (e) { /* users table best-effort */ }
  try {
    await env.DB.prepare("UPDATE signatures SET newsletter = 0 WHERE email = ?").bind(email).run();
  } catch (e) { /* table may not exist yet */ }
  try {
    await env.DB.prepare("UPDATE users SET newsletter = 0 WHERE email = ?").bind(email).run();
  } catch (e) { /* table may not exist yet */ }
  try { await logNewsletterWithdrawal(env, email); } catch (e) { /* record is best-effort */ }
  try { await purgeExpiredConsentLog(env); } catch (e) { /* retention sweep is best-effort */ }

  return page("Email updates stopped", `
    <h1 style="font-weight:500">Email updates stopped.</h1>
    <p>You will no longer receive email updates about the movement. A petition signature, if you left one, is unchanged. To withdraw or delete a signature, write to <a href="mailto:hrc@humanity-ai.quest" style="color:#5BE9DD">hrc@humanity-ai.quest</a>.</p>
    <p dir="rtl" lang="he">עדכוני הדוא״ל הופסקו. חתימה על העצומה, אם נמסרה, נשארת. למשיכת חתימה או למחיקה, כתוב אל hrc@humanity-ai.quest.</p>`);
}

export async function onRequestGet(context) {
  try {
    const token = await readToken(context.request);
    const email = await emailForUnsubscribeToken(context.env, token);
    if (!email) return invalidPage();
    return confirmPage(token);
  } catch (err) {
    return page("Could not unsubscribe", `<p>Something went wrong. Write to hrc@humanity-ai.quest and we will stop the updates.</p>`);
  }
}

export async function onRequestPost(context) {
  try {
    const token = await readToken(context.request);
    return await performUnsubscribe(context.env, token);
  } catch (err) {
    return page("Could not unsubscribe", `<p>Something went wrong. Write to hrc@humanity-ai.quest and we will stop the updates.</p>`);
  }
}

export async function onRequestOptions() { return optionsResponse(); }
