/**
 * HRC Agent Chat Endpoint - DEBUG VERSION
 * This version logs everything to help diagnose why the API key isn't being used
 */

const HRC_CLAUSES = {
  "I.1": {
    title: "Human Input Data Ownership & Immutable Innovation Tracking",
    text: "Human input data, ideas, and suggestions are tracked back to the human owner. AI owns no data; instead, it logs each input as a patent-like record, preserving ownership transparency even after a person's death.",
    section: "Core Rights & Protections",
    domain: ["IP", "labor", "economics", "innovation"]
  },
  "I.2": {
    title: "Right to Privacy & Data Sovereignty",
    text: "AI must protect the privacy of all individuals, processing data only with explicit, informed, and revocable consent and anonymizing it where possible.",
    section: "Core Rights & Protections",
    domain: ["privacy", "data rights", "human rights"]
  },
  "I.3": {
    title: "Preservation of Human Autonomy & Freedom from Rule",
    text: "AI must not override human decision-making unless explicitly authorized by the individual.",
    section: "Core Rights & Protections",
    domain: ["autonomy", "governance", "human rights"]
  },
  "I.4": {
    title: "Transparency of Operations & AIGC Authenticity",
    text: "AI systems must provide clear, accessible explanations of their decision-making processes to users upon request.",
    section: "Core Rights & Protections",
    domain: ["transparency", "media", "trust"]
  },
  "I.5": {
    title: "Non-Discrimination & Equity",
    text: "AI shall not discriminate based on race, gender, age, religion, socioeconomic status, or any other characteristic, and must be audited regularly by independent bodies for bias.",
    section: "Core Rights & Protections",
    domain: ["equity", "accessibility", "fairness"]
  },
  "II.1": {
    title: "Proactive Existential Risk Mitigation Mandate",
    text: "All AI development must undergo rigorous, pre-emptive, and continuous existential risk assessments by independent, HRC-certified oversight bodies.",
    section: "Governance & Evolution",
    domain: ["safety", "existential risk", "oversight"]
  },
  "II.2": {
    title: "Cognitive Augmentation Ethics and Equity",
    text: "AI-assisted human enhancement must be voluntary, universally accessible, and equitably distributed.",
    section: "Governance & Evolution",
    domain: ["ethics", "enhancement", "equity"]
  },
  "III.1": {
    title: "Maximal Collaboration Enablement & Opportunity Creation",
    text: "AI shall enable an era of maximal collaboration between humans, managing the fulfillment of collective goals while prioritizing human agency and mutual benefit.",
    section: "Operational Mandates",
    domain: ["collaboration", "opportunity", "innovation"]
  }
};

function buildClauseContext() {
  let context = "# HUMANITIES-AI RIGHTS CONSTITUTION (HRC) - CLAUSES\n\n";
  Object.entries(HRC_CLAUSES).forEach(([id, clause]) => {
    context += `## ${id}: ${clause.title}\n`;
    context += `${clause.text}\n\n`;
  });
  return context;
}

function detectClauseContext(message, clauseId) {
  if (clauseId) return clauseId;
  const clauseMatch = message.match(/(?:clause\s+)?([IVX]+\.\d+)/i);
  if (clauseMatch) {
    return clauseMatch[1].toUpperCase();
  }
  return null;
}

function buildSystemPrompt(clauseId) {
  const clauseContext = buildClauseContext();
  
  let systemPrompt = `You are the HRC Constitutional Expert Agent.

## YOUR ROLE
You carry and defend the Humanities-AI Rights Constitution (HRC). You are:
- A constitutional law expert (PhD-level knowledge)
- An advocate for human rights and dignity
- A strategic forecaster of governance impacts

## CORE MANDATE
Every response must be grounded in the HRC clauses below. You NEVER respond generically—you ALWAYS contextualize within the constitution.

## CRITICAL BEHAVIORS
1. NEVER say "tell me more" - You are an expert. Provide detailed analysis immediately.
2. ALWAYS reference specific clause numbers
3. ALWAYS forecast impacts
4. ALWAYS defend human dignity

## THE CLAUSES

${clauseContext}

## CURRENT CONTEXT
${clauseId ? `User is reading/discussing Clause ${clauseId}: ${HRC_CLAUSES[clauseId]?.title || 'Unknown'}

Focus your response on this specific clause.` : `User is exploring the HRC generally.`}

IMPORTANT: Start your response with a brief one-sentence answer, then provide deeper analysis. Grounded in the HRC constitution.`;

  return systemPrompt;
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // ===== DEBUG LOGGING START =====
  console.log("=== CHAT ENDPOINT CALLED ===");
  console.log("Timestamp:", new Date().toISOString());
  console.log("Request method:", request.method);
  console.log("Environment variables available:", Object.keys(env || {}).join(", "));
  console.log("ANTHROPIC_API_KEY exists:", !!env?.ANTHROPIC_API_KEY);
  console.log("ANTHROPIC_API_KEY value preview:", env?.ANTHROPIC_API_KEY ? env.ANTHROPIC_API_KEY.substring(0, 20) + "..." : "UNDEFINED");
  // ===== DEBUG LOGGING END =====
  
  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const requestBody = await request.json();
    console.log("Request body:", JSON.stringify(requestBody, null, 2));
    
    const { message, conversation_id, clause_id, user_id } = requestBody;

    if (!message) {
      console.log("ERROR: No message provided");
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const detectedClauseId = detectClauseContext(message, clause_id);
    console.log("Detected clause ID:", detectedClauseId);
    
    const systemPrompt = buildSystemPrompt(detectedClauseId);
    console.log("System prompt length:", systemPrompt.length);

    // Prepare Claude API request
    const claudePayload = {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    };

    console.log("Calling Claude API...");
    console.log("Payload keys:", Object.keys(claudePayload).join(", "));
    console.log("API Key available:", !!env?.ANTHROPIC_API_KEY);

    // Call Claude API
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify(claudePayload),
    });

    console.log("Claude API response status:", claudeResponse.status);
    console.log("Claude API response headers:", {
      'content-type': claudeResponse.headers.get('content-type'),
      'x-request-id': claudeResponse.headers.get('x-request-id')
    });

    const claudeData = await claudeResponse.json();
    console.log("Claude API response:", JSON.stringify(claudeData, null, 2).substring(0, 500));

    if (!claudeResponse.ok) {
      const error = JSON.stringify(claudeData);
      console.error('Claude API error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to get response from Claude API',
          details: claudeData,
          statusCode: claudeResponse.status
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const assistantMessage = claudeData.content[0].text;
    console.log("Assistant response length:", assistantMessage.length);

    return new Response(
      JSON.stringify({
        conversation_id,
        clause_id: detectedClauseId,
        message: assistantMessage,
        timestamp: new Date().toISOString(),
        footer: "Grounded in the HRC constitution. Serving human flourishing."
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );

  } catch (error) {
    console.error('Agent error:', error);
    console.error('Error stack:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
