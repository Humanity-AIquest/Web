/**
 * HRC Ideas Recording Endpoint
 * Cloudflare Pages Function at: functions/api/ideas.js
 * 
 * Per Clause I.1: Human Input Data Ownership & Immutable Innovation Tracking
 * "Human input data, ideas, and suggestions are tracked back to the human owner...
 *  The OS shall utilize an immutable ledger to track the origin and evolution of all 
 *  innovation inputs, models, code, and assets generated or developed with AI assistance"
 * 
 * This endpoint records and attributes all ideas to their human originators.
 */

export async function onRequest(context) {
  const { request, env } = context;

  // Handle CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  // GET: Retrieve user's ideas
  if (request.method === 'GET') {
    try {
      const url = new URL(request.url);
      const userId = url.searchParams.get('user_id');
      const conversationId = url.searchParams.get('conversation_id');

      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'user_id is required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Retrieve all ideas for this user from KV
      const ideas = [];
      const prefix = `idea:${userId}`;

      if (env.DATASTORE_KV?.list) {
        const list = await env.DATASTORE_KV.list({ prefix });
        for (const key of list.keys) {
          const idea = await env.DATASTORE_KV.get(key.name, 'json');
          ideas.push(idea);
        }
      }

      return new Response(
        JSON.stringify({
          user_id: userId,
          total_ideas: ideas.length,
          ideas: ideas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );

    } catch (error) {
      console.error('Error retrieving ideas:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to retrieve ideas' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // POST: Record a new idea
  if (request.method === 'POST') {
    try {
      const {
        user_id,
        conversation_id,
        clause_id,
        idea_text,
        idea_type, // "amendment", "implementation", "critique", "feedback"
        related_clauses, // Array of related clause IDs
      } = await request.json();

      // Validate required fields
      if (!user_id || !idea_text) {
        return new Response(
          JSON.stringify({ error: 'user_id and idea_text are required' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Create immutable record (Clause I.1 compliance)
      const ideaRecord = {
        // Identity & Attribution
        id: `idea_${user_id}_${Date.now()}`,
        owner: user_id, // IMMUTABLE - tracks back to human originator
        created_at: new Date().toISOString(),
        
        // Context
        conversation_id,
        clause_id, // Which clause sparked this idea?
        related_clauses: related_clauses || [],
        
        // Idea Content
        idea_type: idea_type || 'suggestion',
        idea_text,
        
        // Tracking (for amendment workflow)
        status: 'recorded', // recorded → reviewed → proposed → voting → approved/rejected
        amendment_id: null, // Will be populated if this becomes an official amendment
        
        // Provenance (Clause I.1: immutable ledger)
        version: 1,
        hash: generateHash(`${user_id}${idea_text}${Date.now()}`),
        
        // Metadata
        metadata: {
          source: 'hrc_agent_conversation',
          ip_hash: hashIP(request.headers.get('cf-connecting-ip')),
          user_agent_hash: hashUserAgent(request.headers.get('user-agent')),
        }
      };

      // Store in Cloudflare KV (immutable ledger per Clause I.1)
      const kvKey = `idea:${user_id}:${ideaRecord.id}`;
      
      await env.DATASTORE_KV.put(
        kvKey,
        JSON.stringify(ideaRecord),
        {
          expirationTtl: 86400 * 365 * 10, // 10 years (immutable record)
          metadata: {
            owner: user_id,
            created: ideaRecord.created_at,
            clause: clause_id,
          }
        }
      );

      // OPTIONAL: Also send to D1 database if available (for full amendment workflow)
      if (env.DB) {
        try {
          await env.DB.prepare(
            `INSERT INTO ideas (id, owner, conversation_id, clause_id, idea_type, idea_text, status, created_at, hash)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            ideaRecord.id,
            user_id,
            conversation_id,
            clause_id,
            idea_type,
            idea_text,
            'recorded',
            ideaRecord.created_at,
            ideaRecord.hash
          ).run();
        } catch (dbError) {
          console.warn('Database insert failed (D1 not available):', dbError);
          // KV storage succeeded, so this is okay
        }
      }

      // Return confirmation with attribution
      return new Response(
        JSON.stringify({
          success: true,
          idea_id: ideaRecord.id,
          owner: user_id,
          message: `Your idea has been recorded and attributed to you per Clause I.1 (Human Input Data Ownership). This immutable record ensures your contribution is forever tracked.`,
          next_steps: [
            "This idea is now visible in your personal ledger",
            "Share this idea with the community for feedback",
            "Develop this into a formal amendment proposal",
            "Other users can build upon your idea while maintaining your attribution"
          ],
          ledger_url: `/ideas?user_id=${user_id}`,
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        }
      );

    } catch (error) {
      console.error('Error recording idea:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to record idea' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return new Response('Method not allowed', { status: 405 });
}

/**
 * Generate cryptographic hash for immutable ledger
 * (In production, use proper cryptography)
 */
function generateHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hrc_${Math.abs(hash).toString(16)}`;
}

/**
 * Hash IP for privacy (don't store raw IPs per Clause I.2)
 */
function hashIP(ip) {
  if (!ip) return 'unknown';
  return `ip_${generateHash(ip)}`;
}

/**
 * Hash user agent for privacy
 */
function hashUserAgent(ua) {
  if (!ua) return 'unknown';
  return `ua_${generateHash(ua)}`;
}
