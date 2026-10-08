/**
 * /api/unsubscribe?token=
 * GET or POST — stop newsletter mail for the address behind this token.
 * Does not delete a petition signature. Signature deletion stays a request to
 * hrc@humanity-ai.quest, carried out by an admin delete (which purges the
 * interactions index).
 */
import { optionsResponse, ensureAuthSchema } from "./_shared.js";
import { ensureMovementSchema } from "./_movement.js";
import { emailForUnsubscribeToken, logNewsletterWithdrawal } from "./_consent.js";

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

async function handle(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    let token = url.searchParams.get("token") || "";
    if (!token && request.method === "POST") {
      const ctype = request.headers.get("content-type") || "";
      if (ctype.includes("application/json")) {
        const body = await request.json().catch(() => ({}));
        token = body.token || "";
      } else {
        const form = await request.formData().catch(() => null);
        token = form?.get("token") || "";
      }
    }
    const email = await emailForUnsubscribeToken(env, token);
    if (!email) {
      return page("Link not valid", `
        <h1 style="font-weight:500">This unsubscribe link is not valid.</h1>
        <p>To stop email updates, write to <a href="mailto:hrc@humanity-ai.quest" style="color:#5BE9DD">hrc@humanity-ai.quest</a>.</p>
        <p dir="rtl" lang="he">הקישור אינו תקף. כדי להפסיק עדכונים בדוא״ל, כתוב אל hrc@humanity-ai.quest.</p>`);
    }

    try { await ensureMovementSchema(env); } catch (e) { /* signatures table may be absent in a bare test */ }
    try { await ensureAuthSchema(env); } catch (e) { /* users table best-effort */ }
    try {
      await env.DB.prepare("UPDATE signatures SET newsletter = 0 WHERE email = ?").bind(email).run();
    } catch (e) { /* table may not exist yet */ }
    try {
      await env.DB.prepare("UPDATE users SET newsletter = 0 WHERE email = ?").bind(email).run();
    } catch (e) { /* table may not exist yet */ }
    try { await logNewsletterWithdrawal(env, email); } catch (e) { /* record is best-effort */ }

    return page("Email updates stopped", `
      <h1 style="font-weight:500">Email updates stopped.</h1>
      <p>You will no longer receive email updates about the movement. A petition signature, if you left one, is unchanged. To withdraw or delete a signature, write to <a href="mailto:hrc@humanity-ai.quest" style="color:#5BE9DD">hrc@humanity-ai.quest</a>.</p>
      <p dir="rtl" lang="he">עדכוני הדוא״ל הופסקו. חתימה על העצומה, אם נמסרה, נשארת. למשיכת חתימה או למחיקה, כתוב אל hrc@humanity-ai.quest.</p>`);
  } catch (err) {
    return page("Could not unsubscribe", `<p>Something went wrong. Write to hrc@humanity-ai.quest and we will stop the updates.</p>`);
  }
}

export async function onRequestGet(context) { return handle(context); }
export async function onRequestPost(context) { return handle(context); }
export async function onRequestOptions() { return optionsResponse(); }
