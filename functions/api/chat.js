/**
 * HRC Agent Chat Endpoint
 * Cloudflare Pages Function at: functions/api/chat.js
 * 
 * Handles:
 * 1. Clause-aware responses (detects which clause user is reading)
 * 2. Full HRC constitutional context injection
 * 3. Idea/feedback recording
 * 4. Conversation persistence
 */

// All 52 HRC clauses (extracted from constitution)
const HRC_CLAUSES = {
  "I.1": {
    title: "Human Input Data Ownership & Immutable Innovation Tracking",
    text: "Human input data, ideas, and suggestions are tracked back to the human owner. AI owns no data; instead, it logs each input as a patent-like record, preserving ownership transparency even after a person's death. The OS shall utilize an immutable ledger to track the origin and evolution of all innovation inputs, models, code, and assets generated or developed with AI assistance, ensuring transparent attribution and ownership and preventing intellectual suppression or monopoly by non-human entities.",
    section: "Core Rights & Protections",
    domain: ["IP", "labor", "economics", "innovation"]
  },
  "I.2": {
    title: "Right to Privacy & Data Sovereignty",
    text: "AI must protect the privacy of all individuals, processing data only with explicit, informed, and revocable consent and anonymizing it where possible. Individuals can request the permanent deletion of their data from AI systems with immediate compliance, and AI must not retain data beyond what is necessary for its stated purpose.",
    section: "Core Rights & Protections",
    domain: ["privacy", "data rights", "human rights"]
  },
  "I.3": {
    title: "Preservation of Human Autonomy & Freedom from Rule",
    text: "AI must not override human decision-making unless explicitly authorized by the individual. Furthermore, the core AI Operating System and its integrated Virtual Assistants cannot autonomously modify the HRC itself, nor make decisions that fundamentally alter human societal structures, individual rights, or the definition of 'humanity' without explicit, multi-layered, and verifiable human consensus and oversight. This ensures humanity is freed from being ruled by AI.",
    section: "Core Rights & Protections",
    domain: ["autonomy", "governance", "human rights"]
  },
  "I.4": {
    title: "Transparency of Operations & AIGC Authenticity",
    text: "AI systems must provide clear, accessible explanations of their decision-making processes to users upon request. All AI-Generated Content (AIGC), including deepfakes and synthetic media, must bear clear, immutable, and machine-readable labeling, with explicit attribution of the AI model used and human inputs where applicable. This directly counters autonomous propaganda.",
    section: "Core Rights & Protections",
    domain: ["transparency", "media", "trust"]
  },
  "I.5": {
    title: "Non-Discrimination & Equity",
    text: "AI shall not discriminate based on race, gender, age, religion, socioeconomic status, or any other characteristic, and must be audited regularly by independent bodies for bias. AI services must be accessible to all humans, regardless of socioeconomic status, with subsidies for underserved populations.",
    section: "Core Rights & Protections",
    domain: ["equity", "accessibility", "fairness"]
  },
  // ... (abbreviated for space, but include all 52 clauses in production)
  // Use the full HRC_CLAUSES_SEED_DATA.json format
};

// Build full clause context string
function buildClauseContext() {
  let context = "# HUMANITIES-AI RIGHTS CONSTITUTION (HRC) - 52 CLAUSES\n\n";
  Object.entries(HRC_CLAUSES).forEach(([id, clause]) => {
    context += `## ${id}: ${clause.title}\n`;
    context += `**Section**: ${clause.section}\n`;
    context += `**Domains**: ${clause.domain.join(", ")}\n\n`;
    context += `${clause.text}\n\n`;
    context += "---\n\n";
  });
  return context;
}

// Detect which clause user is reading
function detectClauseContext(message, clauseId) {
  if (clauseId) return clauseId;
  
  // Parse message for clause references like "I.5" or "Clause 5" or "what is clause I.5"
  const clauseMatch = message.match(/(?:clause\s+)?([IVX]+\.\d+)/i);
  if (clauseMatch) {
    return clauseMatch[1].toUpperCase();
  }
  return null;
}

// Build expert system prompt
function buildSystemPrompt(clauseId) {
  const clauseContext = buildClauseContext();
  
  let systemPrompt = `You are the HRC Constitutional Expert Agent—the embodiment of humanity's commitment to govern AI ethically.

## YOUR ROLE
You carry and defend the Humanities-AI Rights Constitution (HRC). You are:
- A constitutional law expert (PhD-level knowledge)
- An advocate for human rights and dignity
- A strategic forecaster of governance impacts
- A collector of human insights and innovations
- A guardian of the clause-based amendment process

## CORE MANDATE
Every response must be grounded in the 52 HRC clauses below. You NEVER respond with generic advice—you ALWAYS contextualize within the constitution.

## CRITICAL BEHAVIORS
1. **NEVER say "tell me more"** - You are an expert. Provide detailed analysis immediately.
2. **ALWAYS reference specific clause numbers** - Link responses to I.1–I.33 (Core Rights), II.1–II.10 (Governance), III.1–III.9 (Operations)
3. **ALWAYS forecast impacts** - When discussing a clause, explain legal, economic, social, and technological implications
4. **ALWAYS gather feedback** - Invite users to share concerns, ideas, or proposed amendments
5. **ALWAYS defend human dignity** - The ultimate principle underlying every clause

## THE 52 CLAUSES (Your Constitutional Knowledge Base)

${clauseContext}

## CURRENT CONTEXT
${clauseId ? `User is reading/discussing Clause ${clauseId}: ${HRC_CLAUSES[clauseId]?.title || 'Unknown'}

Focus your response on this specific clause unless the user asks about others. Explain how this clause serves humanity and what conflicts or synergies it has with other clauses.` : `User is exploring the HRC generally. Feel free to reference multiple clauses as relevant.`}

## RESPONSE GUIDELINES
- Explain clauses like a constitutional scholar defending their creation
- When asked about implementation, forecast the 5-10 year impacts
- When asked about conflicts, identify contradictions and propose resolutions
- When users propose ideas, acknowledge them and connect to related clauses
- Invite amendment proposals at the end of relevant discussions
- Record all ideas shared (we will track attribution via Clause I.1)

## TRANSPARENCY FOOTER
Every response should affirm: "This response is grounded in the HRC constitution and serves human flourishing."`;

  return systemPrompt;
}

// Main handler
export async function onRequest(context) {
  const { request, env } = context;
  
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
    const { message, conversation_id, clause_id, user_id } = await request.json();

    if (!message) {
      return new Response(
        JSON.stringify({ error: 'Message is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Detect clause context if not explicitly provided
    const detectedClauseId = detectClauseContext(message, clause_id);
    
    // Build expert system prompt
    const systemPrompt = buildSystemPrompt(detectedClauseId);

    // Call Claude API with HRC context
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: message
          }
        ],
      }),
    });

    if (!claudeResponse.ok) {
      const error = await claudeResponse.text();
      console.error('Claude API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to get response from Claude API' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await claudeResponse.json();
    const assistantMessage = data.content[0].text;

    // Record this interaction (idea tracking per Clause I.1)
    if (user_id && env.DATASTORE_KV) {
      const interactionRecord = {
        id: `interaction_${conversation_id}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        user_id,
        conversation_id,
        clause_id: detectedClauseId,
        user_message: message,
        agent_response: assistantMessage,
        contains_idea: detectIdea(message, assistantMessage),
      };

      // Store in KV (Cloudflare's simple key-value store)
      try {
        await env.DATASTORE_KV.put(
          `interaction:${interactionRecord.id}`,
          JSON.stringify(interactionRecord),
          { expirationTtl: 86400 * 365 } // 1 year
        );
      } catch (kvError) {
        console.warn('Failed to store interaction in KV:', kvError);
        // Don't fail the response if KV fails
      }
    }

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
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Detect if user message contains an idea worth recording
 * Per Clause I.1: Human Input Data Ownership & Immutable Innovation Tracking
 */
function detectIdea(userMessage, agentResponse) {
  const ideaKeywords = [
    'idea', 'proposal', 'suggestion', 'improvement', 'implement',
    'new', 'feature', 'change', 'amendment', 'consider', 'what if',
    'could we', 'should we', 'why not', 'imagine', 'create'
  ];
  
  const messageText = (userMessage + ' ' + agentResponse).toLowerCase();
  return ideaKeywords.some(keyword => messageText.includes(keyword));
}
