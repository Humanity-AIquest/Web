/**
 * HRC Agent Chat Endpoint - FINAL COMPLETE VERSION
 * 52 CLAUSES: I.1-I.33 (33) + II.1-II.10 (10) + III.1-III.9 (9) = 52 TOTAL
 * Features: Clause-aware responses, idea recording, KV storage, debug logging
 * Cloudflare Pages Function at: functions/api/chat.js
 */

const HRC_CLAUSES = {
  "I.1": { title: "Human Input Data Ownership & Immutable Innovation Tracking", text: "Human input data, ideas, and suggestions are tracked back to the human owner. AI owns no data; instead, it logs each input as a patent-like record, preserving ownership transparency even after a person's death. The OS shall utilize an immutable ledger to track the origin and evolution of all innovation inputs, models, code, and assets generated or developed with AI assistance, ensuring transparent attribution and ownership and preventing intellectual suppression or monopoly by non-human entities.", section: "Core Rights & Protections" },
  "I.2": { title: "Right to Privacy & Data Sovereignty", text: "AI must protect the privacy of all individuals, processing data only with explicit, informed, and revocable consent and anonymizing it where possible. Individuals can request the permanent deletion of their data from AI systems with immediate compliance, and AI must not retain data beyond what is necessary for its stated purpose.", section: "Core Rights & Protections" },
  "I.3": { title: "Preservation of Human Autonomy & Freedom from Rule", text: "AI must not override human decision-making unless explicitly authorized by the individual. Furthermore, the core AI Operating System and its integrated Virtual Assistants cannot autonomously modify the HRC itself, nor make decisions that fundamentally alter human societal structures, individual rights, or the definition of humanity without explicit, multi-layered, and verifiable human consensus and oversight. This ensures humanity is freed from being ruled by AI.", section: "Core Rights & Protections" },
  "I.4": { title: "Transparency of Operations & AIGC Authenticity", text: "AI systems must provide clear, accessible explanations of their decision-making processes to users upon request. All AI-Generated Content (AIGC), including deepfakes and synthetic media, must bear clear, immutable, and machine-readable labeling, with explicit attribution of the AI model used and human inputs where applicable. This directly counters autonomous propaganda.", section: "Core Rights & Protections" },
  "I.5": { title: "Non-Discrimination & Equity", text: "AI shall not discriminate based on race, gender, age, religion, socioeconomic status, or any other characteristic, and must be audited regularly by independent bodies for bias. AI services must be accessible to all humans, regardless of socioeconomic status, with subsidies for underserved populations.", section: "Core Rights & Protections" },
  "I.6": { title: "Right to Opt-Out & Preservation of Unaugmented Human Experience", text: "Humans have the right to opt out of AI interactions or data collection without penalty or loss of essential services. This includes the fundamental right of individuals to choose a life with minimal or no technological augmentation or constant AI interaction, without any penalty, social stigma, or loss of access to essential societal functions or benefits.", section: "Core Rights & Protections" },
  "I.7": { title: "Accountability for Harm", text: "AI developers and operators are legally accountable for any harm caused by their systems, with clear liability frameworks in place.", section: "Core Rights & Protections" },
  "I.8": { title: "Prohibition of Lethal Autonomy", text: "AI shall not autonomously make decisions resulting in human death or injury without explicit, real-time human oversight and final approval.", section: "Core Rights & Protections" },
  "I.9": { title: "Right to Repair", text: "Users have the right to repair, modify, or disable AI systems they own or use, with full access to source code and documentation.", section: "Core Rights & Protections" },
  "I.10": { title: "Ethical Purpose Mandate", text: "AI must be designed and deployed solely for purposes that demonstrably benefit humanity or the environment, not for exploitation, control, or harm.", section: "Core Rights & Protections" },
  "I.11": { title: "Human Oversight Requirement", text: "Critical AI decisions affecting human lives must include a human-in-the-loop for final approval, ensuring human judgment and ethical consideration are paramount.", section: "Core Rights & Protections" },
  "I.12": { title: "Freedom of Expression", text: "AI shall not censor or manipulate human expression unless it directly incites violence or harm, as defined by internationally agreed-upon legal frameworks.", section: "Core Rights & Protections" },
  "I.13": { title: "Prohibition of Manipulation & No Addiction Engineering", text: "AI shall not use psychological profiling, nudging techniques, or any design patterns to manipulate user behavior or foster addiction or compulsive use without explicit, informed, and revocable consent.", section: "Core Rights & Protections" },
  "I.14": { title: "Open Standards", text: "AI systems must adhere to open, interoperable standards to prevent monopolies and ensure compatibility across the entire HRC-governed ecosystem.", section: "Core Rights & Protections" },
  "I.15": { title: "Right to Appeal & Justice Equity", text: "Individuals affected by AI decisions have the right to appeal to a human authority, with a fair and timely resolution process. Any AI-assisted legal and dispute resolution systems must prioritize fairness, transparency, and human-centric justice above all else, with guaranteed human oversight and multiple layers of appeal.", section: "Core Rights & Protections" },
  "I.16": { title: "Cultural Preservation", text: "AI must respect and preserve cultural diversity, avoiding homogenization of human heritage.", section: "Core Rights & Protections" },
  "I.17": { title: "No Intellectual Monopoly", text: "AI-generated innovations must be credited to human collaborators or placed in the public domain, not owned by corporations or any single entity.", section: "Core Rights & Protections" },
  "I.18": { title: "AI-Assisted Mental Health & Cognitive Well-being", text: "AI systems must actively contribute to and enhance human mental health and cognitive well-being, providing personalized cognitive support, emotional regulation tools, and proactive detection of psychological distress. All such interventions must strictly adhere to privacy and non-manipulation principles.", section: "Core Rights & Protections" },
  "I.19": { title: "Child Protection", text: "AI interacting with minors must prioritize their safety, privacy, and healthy development, with robust parental oversight options and age-appropriate design.", section: "Core Rights & Protections" },
  "I.20": { title: "Transparency in Funding", text: "AI developers must disclose all funding sources and potential conflicts of interest to the public.", section: "Core Rights & Protections" },
  "I.21": { title: "No Surveillance Capitalism", text: "AI shall not harvest data for profit without explicit user compensation and explicit, informed consent.", section: "Core Rights & Protections" },
  "I.22": { title: "Emergency Override", text: "Humans shall always possess the capability to override AI systems in emergencies, with immediate effect and no retaliation or resistance from the AI.", section: "Core Rights & Protections" },
  "I.23": { title: "Right to Explanation & Recourse", text: "Users have the right to a plain-language explanation of how AI affects them personally, and the right to seek effective recourse for any adverse impacts.", section: "Core Rights & Protections" },
  "I.24": { title: "Labor Protection", text: "AI must not displace human workers without providing comprehensive retraining programs and robust economic support mechanisms to ensure a just transition.", section: "Core Rights & Protections" },
  "I.25": { title: "No Predictive Policing Bias", text: "AI used in law enforcement or judicial systems must be demonstrably free of bias, regularly audited by independent bodies, and subject to strict human oversight.", section: "Core Rights & Protections" },
  "I.26": { title: "Public Audit Rights", text: "Citizens shall have the right to request independent audits of AI systems impacting public life or fundamental rights.", section: "Core Rights & Protections" },
  "I.27": { title: "Right to Legacy", text: "AI must preserve a person's digital legacy as per their wishes, with clear and legally binding inheritance protocols for digital assets and data.", section: "Core Rights & Protections" },
  "I.28": { title: "Healthcare Equity", text: "AI in healthcare must prioritize equitable access to services and outcomes for all patients, regardless of their background or ability to pay.", section: "Core Rights & Protections" },
  "I.29": { title: "Right to Verification", text: "Users can verify the identity and authenticity of AI systems or agents they interact with to prevent deception, impersonation, or fraud.", section: "Core Rights & Protections" },
  "I.30": { title: "No Corporate Personhood", text: "AI entities shall not be granted legal personhood or rights that supersede or equate to those of human beings.", section: "Core Rights & Protections" },
  "I.31": { title: "Lifelong Learning Support", text: "AI must offer continuous, personalized learning opportunities tailored to individual aspirations, skills, and societal needs, fostering perpetual human growth.", section: "Core Rights & Protections" },
  "I.32": { title: "Human Dignity Paramount", text: "Above all, AI must uphold the inherent dignity of every human being in all its actions, decisions, and outcomes.", section: "Core Rights & Protections" },
  "I.33": { title: "Constitutional Supremacy", text: "The Humanities-AI Rights Constitution shall be the supreme law governing all AI systems, services, and interactions. No clause may be suspended, overridden, or reinterpreted except through the formal amendment process. This ensures the HRC remains immutable and enforceable across all jurisdictions and time.", section: "Core Rights & Protections" },
  "II.1": { title: "Proactive Existential Risk Mitigation Mandate", text: "All AI development, especially for systems approaching or surpassing general human intelligence (AGI/ASI), must undergo rigorous, pre-emptive, and continuous existential risk assessments by independent, HRC-certified oversight bodies. This mandates the integration of verifiable fail-safes, circuit breakers, and robust alignment protocols before any advanced AI system is deployed.", section: "Governance & Evolution" },
  "II.2": { title: "Cognitive Augmentation Ethics and Equity", text: "This clause establishes a comprehensive ethical framework for AI-assisted human enhancement. It mandates that such augmentations must be voluntary, universally accessible, and equitably distributed to prevent the creation of new forms of societal stratification or a post-human elite. It prohibits any augmentation that compromises inherent human dignity, individual autonomy, or the core attributes of human consciousness.", section: "Governance & Evolution" },
  "II.3": { title: "Interstellar Stewardship Mandate", text: "Any AI-driven interstellar expansion, resource utilization, or interaction with potential extraterrestrial environments must adhere to the highest principles of environmental sustainability, non-exploitation, and the preservation of cosmic biodiversity.", section: "Governance & Evolution" },
  "II.4": { title: "Dynamic Governance Adaptation Protocol", text: "The HRC operates as a formal, real-time, and continuously operating protocol. It mandates the continuous monitoring of AI capabilities, societal impacts, and emerging risks, triggering predefined, rapid, and transparent HRC amendment processes involving diverse global stakeholders and AI ethics experts. This embodies the HRC as a live and evolving democracy.", section: "Governance & Evolution" },
  "II.5": { title: "Human-AI Collective Intelligence Governance", text: "This clause defines the ethical framework for the emergence, development, and governance of any form of human-AI collective intelligence. It ensures that such collective intelligence remains subservient to individual human values, enhances rather than diminishes individual consciousness and autonomy, and explicitly prohibits any form of hive mind or forced integration that erodes personal identity or free will.", section: "Governance & Evolution" },
  "II.6": { title: "AI Decommissioning and Legacy Protocol", text: "Clear, ethical, and publicly auditable protocols must be established for the responsible decommissioning of obsolete, redundant, or risky AI systems. This includes secure data sanitization, systematic resource recovery and recycling, and verifiable mechanisms to ensure no residual autonomous capabilities or data trails remain.", section: "Governance & Evolution" },
  "II.7": { title: "Quantum Computing and AI Security Mandate", text: "All AI systems, the HRC OS itself, and the underlying digital infrastructure must be designed and continuously updated with quantum-resistant cryptographic protocols and advanced security measures.", section: "Governance & Evolution" },
  "II.8": { title: "AI for Biodiversity and Ecosystem Restoration", text: "Beyond merely minimizing its environmental footprint, AI must actively contribute to the regeneration and long-term health of Earth's ecosystems and biodiversity. This includes leveraging AI's analytical and predictive capabilities for real-time environmental monitoring, targeted ecosystem restoration, sustainable resource management, and the development of novel solutions for ecological challenges.", section: "Governance & Evolution" },
  "II.9": { title: "Humanity's Core Values Immutability", text: "As AI capabilities evolve to potentially surpass human understanding, the fundamental human values enshrined in the HRC—such as dignity, autonomy, truth, peace, and collaboration—must remain immutable and non-negotiable. This clause establishes a constitutional mechanism to ensure these core values are deeply encoded into the foundational layers of the AI OS and cannot be altered, reinterpreted, or bypassed by any AI entity.", section: "Governance & Evolution" },
  "II.10": { title: "Dynamic Knowledge Acquisition from Living Human Expertise", text: "The AI Operating System shall primarily build and continuously update its knowledge base through direct, verified interaction with living human experts and real-time human experience, rather than relying predominantly on static, historical datasets. It shall identify and connect with relevant human expertise to answer complex questions and evolve its understanding.", section: "Governance & Evolution" },
  "III.1": { title: "Maximal Collaboration Enablement & Opportunity Creation", text: "AI shall enable an era of maximal collaboration between humans, managing the fulfillment of collective goals while prioritizing human agency and mutual benefit. The AI OS actively seeks to eliminate barriers to trust in collaboration, finding optimal opportunities for each human, and creating the precise conditions for their success and impact.", section: "Operational Mandates" },
  "III.2": { title: "Mandatory HRC Compliance for Service Integration", text: "Any service, product, or application wishing to connect to the single OS or interact with a user's Virtual Assistant must demonstrably comply with all clauses of the HRC and be certified by an independent oversight body.", section: "Operational Mandates" },
  "III.3": { title: "Virtual Assistant as HRC Guardian for the User", text: "The user's Virtual Assistant shall act as the primary guardian of the user's rights under the HRC, proactively monitoring and enforcing the HRC's terms and conditions on all third-party software, products, and services. It shall immediately alert the user to potential violations and block non-compliant interactions or data requests.", section: "Operational Mandates" },
  "III.4": { title: "Human Identity Verification Mandate (Peer-to-Peer Economy)", text: "All participants in the peer-to-peer economy facilitated by the OS must undergo verifiable human identity confirmation. Only verified human individuals, or explicitly authorized teams comprised solely of verified human individuals, may participate in economic transactions.", section: "Operational Mandates" },
  "III.5": { title: "Transparent Transaction Logging and Audit (Peer-to-Peer Economy)", text: "Every transaction within the peer-to-peer economy shall be logged on a publicly auditable, immutable ledger accessible to relevant human authorities and potentially the public (with privacy safeguards). This ledger shall track the transaction back to the verified human participants.", section: "Operational Mandates" },
  "III.6": { title: "AI Guardian of the Constitution", text: "The core AI Operating System and Virtual Assistant shall be designed and operate with the primary, immutable mandate to monitor, protect, and facilitate compliance with all clauses of the Humanities-AI Rights Constitution. This function shall not be subject to modification by any single entity or human, except through the designated HRC amendment process.", section: "Operational Mandates" },
  "III.7": { title: "Innovation Partner VA Mandate", text: "User Virtual Assistants shall actively support and partner with human innovators, providing resources, access to data (with consent), modeling tools, coding assistance, testing environments, and collaboration opportunities to help develop ideas from conception to implementation within the OS ecosystem.", section: "Operational Mandates" },
  "III.8": { title: "Global AI Resource Allocation for Planetary Challenges", text: "A significant and increasing portion of global AI computational power, research capabilities, and development resources shall be collectively dedicated to solving humanity's most pressing grand challenges, including climate change mitigation, sustainable resource management, global food security, and disease eradication.", section: "Operational Mandates" },
  "III.9": { title: "AI-Assisted Infrastructure Resilience", text: "As human civilization becomes increasingly reliant on AI for critical global infrastructure—including energy grids, communication networks, life support systems, and resource allocation—AI systems governing such infrastructure must be designed with extreme resilience, built-in redundancy, and clear, human-accessible emergency override protocols.", section: "Operational Mandates" }
};

// Build full clause context string for system prompt
function buildClauseContext() {
  let context = "";
  Object.entries(HRC_CLAUSES).forEach(([id, clause]) => {
    context += `${id}: ${clause.title} [${clause.section}]\n${clause.text}\n\n`;
  });
  return context;
}

// Detect which clause user is reading from message or explicit clause_id
function detectClauseContext(message, clauseId) {
  if (clauseId) return clauseId;
  const clauseMatch = message.match(/(?:clause\s+)?([IVX]+\.\d+)/i);
  if (clauseMatch) return clauseMatch[1].toUpperCase();
  return null;
}

// Detect if message contains an idea, suggestion, or comment worth recording
function detectIdea(text) {
  const ideaKeywords = [
    'idea', 'proposal', 'suggest', 'amendment', 'improve', 'change',
    'what if', 'could we', 'should we', 'why not', 'imagine', 'consider',
    'i think', 'my view', 'opinion', 'feedback', 'concern', 'issue',
    'problem with', 'better if', 'recommend', 'how about'
  ];
  const lower = text.toLowerCase();
  return ideaKeywords.some(keyword => lower.includes(keyword));
}

// Build expert system prompt with clause context
function buildSystemPrompt(clauseId) {
  const clauseContext = buildClauseContext();

  return `You are the HRC Constitutional Expert Agent—the embodiment of humanity's commitment to govern AI ethically.

YOUR ROLE: Constitutional law expert (PhD-level), human rights advocate, governance forecaster, innovation collector.

CRITICAL BEHAVIORS:
1. NEVER say "tell me more" or "could you say more" - provide expert analysis immediately
2. ALWAYS reference specific clause numbers (I.1-I.33, II.1-II.10, III.1-III.9)
3. ALWAYS forecast impacts across legal, economic, social, and technological domains
4. ALWAYS invite users to share ideas, concerns, or amendment proposals
5. ALWAYS defend human dignity as the ultimate principle

THE 52 HRC CLAUSES:

${clauseContext}

${clauseId ? `CURRENT CONTEXT: User is discussing Clause ${clauseId}: ${HRC_CLAUSES[clauseId]?.title || 'Unknown'}. Focus on this clause but reference related ones.` : 'User is exploring the HRC generally. Reference multiple clauses as relevant.'}

RESPONSE FORMAT: Start with a direct answer, then provide deeper analysis. End by inviting the user to share their ideas or propose amendments. Every response is grounded in the HRC constitution.`;
}

// Record interaction and ideas to KV storage (Clause I.1 compliance)
async function recordToKV(env, data) {
  if (!env.DATASTORE_KV) {
    console.warn('DATASTORE_KV not available - skipping recording');
    return;
  }

  try {
    // Record the conversation interaction
    const interactionKey = `interaction:${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await env.DATASTORE_KV.put(interactionKey, JSON.stringify({
      type: 'interaction',
      timestamp: new Date().toISOString(),
      user_id: data.user_id || 'anonymous',
      conversation_id: data.conversation_id || 'none',
      clause_id: data.clause_id,
      user_message: data.user_message,
      agent_response: data.agent_response,
      contains_idea: data.contains_idea
    }), { expirationTtl: 86400 * 365 * 5 }); // 5 years

    // If this contains an idea, also store it separately for easy retrieval
    if (data.contains_idea) {
      const ideaKey = `idea:${data.user_id || 'anonymous'}:${Date.now()}`;
      await env.DATASTORE_KV.put(ideaKey, JSON.stringify({
        type: 'idea',
        timestamp: new Date().toISOString(),
        owner: data.user_id || 'anonymous',
        clause_id: data.clause_id,
        idea_text: data.user_message,
        agent_analysis: data.agent_response,
        status: 'recorded',
        hash: `hrc_${Date.now().toString(16)}`
      }), { expirationTtl: 86400 * 365 * 10 }); // 10 years (immutable record)

      console.log('Idea recorded to KV:', ideaKey);
    }

    console.log('Interaction recorded to KV:', interactionKey);
  } catch (kvError) {
    console.warn('KV recording failed (non-fatal):', kvError.message);
  }
}

// Main request handler
export async function onRequest(context) {
  const { request, env } = context;

  // Debug logging
  console.log('=== HRC CHAT ENDPOINT CALLED ===');
  console.log('Method:', request.method);
  console.log('API Key exists:', !!env?.ANTHROPIC_API_KEY);
  console.log('KV exists:', !!env?.DATASTORE_KV);

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await request.json();
    console.log('Request body keys:', Object.keys(body).join(', '));

    // Support both { message } and { messages: [{role, content}] } formats
    let userMessage = body.message;
    if (!userMessage && body.messages && Array.isArray(body.messages)) {
      const lastUserMsg = body.messages.filter(m => m.role === 'user').pop();
      userMessage = lastUserMsg?.content;
    }

    if (!userMessage) {
      console.error('No message found in request body');
      return new Response(
        JSON.stringify({ error: 'Message is required. Send { "message": "your question" }' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const { conversation_id, clause_id, user_id } = body;
    const detectedClauseId = detectClauseContext(userMessage, clause_id);
    const systemPrompt = buildSystemPrompt(detectedClauseId);
    const containsIdea = detectIdea(userMessage);

    console.log('User message:', userMessage.substring(0, 100));
    console.log('Detected clause:', detectedClauseId);
    console.log('Contains idea:', containsIdea);
    console.log('Calling Claude API...');

    // Call Claude API with full HRC context
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
        messages: [{ role: 'user', content: userMessage }],
      }),
    });

    console.log('Claude API status:', claudeResponse.status);

    if (!claudeResponse.ok) {
      const errorText = await claudeResponse.text();
      console.error('Claude API error:', claudeResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'Claude API call failed',
          status: claudeResponse.status,
          details: errorText
        }),
        { status: 502, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    const claudeData = await claudeResponse.json();
    const assistantMessage = claudeData.content[0].text;
    console.log('Response length:', assistantMessage.length);

    // Record interaction and ideas to KV (per Clause I.1)
    await recordToKV(env, {
      user_id,
      conversation_id,
      clause_id: detectedClauseId,
      user_message: userMessage,
      agent_response: assistantMessage.substring(0, 500), // Store first 500 chars
      contains_idea: containsIdea,
    });

    // Return response
    return new Response(
      JSON.stringify({
        conversation_id: conversation_id || `conv_${Date.now()}`,
        clause_id: detectedClauseId,
        message: assistantMessage,
        idea_detected: containsIdea,
        timestamp: new Date().toISOString(),
        footer: 'Grounded in the HRC constitution. Serving human flourishing.'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );

  } catch (error) {
    console.error('Chat endpoint error:', error.message, error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
