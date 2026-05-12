// functions/api/chat.js
// Cloudflare Pages Function — secure proxy to the Anthropic API.
// The API key is read from an environment variable set in the Cloudflare dashboard.
// This means the key NEVER appears in browser code or client-side bundles.

export async function onRequestPost(context) {
  const { request, env } = context;

  // Basic CORS for safety
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Verify the API key is configured
  if (!env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY environment variable is not set" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Light validation — only allow the fields we expect
  const { model, max_tokens, system, messages } = body;
  if (!model || !messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "Missing model or messages" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Cap max_tokens so a malicious caller can't run up costs
  const safeMaxTokens = Math.min(max_tokens || 1000, 2000);

  // Cap messages length to prevent abuse
  if (messages.length > 50) {
    return new Response(
      JSON.stringify({ error: "Conversation too long" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model,
        max_tokens: safeMaxTokens,
        system,
        messages
      })
    });

    const data = await anthropicResponse.json();

    return new Response(JSON.stringify(data), {
      status: anthropicResponse.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Upstream call failed", detail: String(err) }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
