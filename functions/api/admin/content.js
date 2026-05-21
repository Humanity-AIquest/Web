/**
 * /api/admin/content — CMS Backend
 * GET — List all content sections or get specific one (L1+)
 * PUT — Update content section with revision history (L3+)
 */
import { json, jsonError, optionsResponse, getUser, requireACL, newId } from "../_shared.js";

// GET /api/admin/content?page_key=home&section_key=hero
export async function onRequestGet(context) {
  const { request, env } = context;
  try {
    const user = await getUser(request, env);
    const aclError = requireACL(user, 1);
    if (aclError) return aclError;

    const url = new URL(request.url);
    const pageKey = url.searchParams.get("page_key");
    const sectionKey = url.searchParams.get("section_key");

    // Specific content
    if (pageKey && sectionKey) {
      const content = await env.DB.prepare(
        "SELECT * FROM site_content WHERE page_key = ? AND section_key = ?"
      ).bind(pageKey, sectionKey).first();

      // Get revision history
      let history = [];
      if (content) {
        const histResult = await env.DB.prepare(
          `SELECT h.*, u.display_name as editor_name
           FROM site_content_history h LEFT JOIN users u ON h.updated_by = u.id
           WHERE h.content_id = ? ORDER BY h.created_at DESC LIMIT 20`
        ).bind(content.id).all();
        history = histResult.results || [];
      }

      return json({ content, history });
    }

    // List all content sections
    const result = await env.DB.prepare(
      `SELECT sc.*, u.display_name as editor_name
       FROM site_content sc LEFT JOIN users u ON sc.updated_by = u.id
       ORDER BY sc.page_key, sc.section_key`
    ).all();

    return json({ content: result.results || [] });
  } catch (err) {
    return jsonError("Failed to load content.");
  }
}

// PUT /api/admin/content — body: { page_key, section_key, content, content_type? }
export async function onRequestPut(context) {
  const { request, env } = context;
  try {
    const user = await getUser(request, env);
    const aclError = requireACL(user, 3);
    if (aclError) return aclError;

    const body = await request.json();
    const { page_key, section_key, content, content_type } = body;

    if (!page_key || !section_key || content === undefined) {
      return jsonError("page_key, section_key, and content are required.");
    }

    // Check if content exists
    const existing = await env.DB.prepare(
      "SELECT id, content FROM site_content WHERE page_key = ? AND section_key = ?"
    ).bind(page_key, section_key).first();

    if (existing) {
      // Save revision
      await env.DB.prepare(
        "INSERT INTO site_content_history (id, content_id, old_content, new_content, updated_by) VALUES (?, ?, ?, ?, ?)"
      ).bind(newId(), existing.id, existing.content, content, user.id).run();

      // Update content
      await env.DB.prepare(
        "UPDATE site_content SET content = ?, content_type = ?, updated_by = ?, updated_at = datetime('now') WHERE id = ?"
      ).bind(content, content_type || "text", user.id, existing.id).run();

      return json({ success: true, action: "updated", page_key, section_key });
    } else {
      // Create new content
      const id = newId();
      await env.DB.prepare(
        "INSERT INTO site_content (id, page_key, section_key, content_type, content, updated_by) VALUES (?, ?, ?, ?, ?, ?)"
      ).bind(id, page_key, section_key, content_type || "text", content, user.id).run();

      return json({ success: true, action: "created", page_key, section_key });
    }
  } catch (err) {
    return jsonError("Failed to update content.");
  }
}

export async function onRequestOptions() { return optionsResponse(); }
