# Contract: `<METHOD> /api/<path>`

> **Template only.** Copy it into a Google Doc in the internal Drive build folder to fill it in.
> Filled contracts for brain endpoints are internal and are **never** committed to this public
> repo. Never put keys, tokens, internal hostnames or certificate details in a contract.

| Field | Value |
|---|---|
| Status | `draft` · `agreed` · `built` · `live` |
| Owner (builds it) | nuron (brain) / claude_code (web) |
| Consumer (calls it) | e.g. Radio Show workspace page |
| Agreed by | nuron ☐ · claude_code ☐ · date |
| Data domain | `website` (D1: members, quests, content) or `brain` (users, projects, tasks, minutes) |
| Tenant | e.g. humanity-ai.quest |
| Visibility | public page · signed-in member · admin only |

## Purpose
One sentence: what this endpoint does for the user.

## Request
```json
{ "example_field": "example value" }
```

## Response (success)
```json
{ "example_field": "example value" }
```

## Response (error)
House rule: HTTP 200 with an error body, so the page can always read it.
```json
{ "error": "Human-readable message" }
```

## Data-domain rules
- IDs from one domain are never reused in the other; a cross-domain link is an explicit field
  (e.g. `brain_user_id` on a website member), never a shared key.
- Brain-internal data (minutes, staff, agent sessions) never appears on a public page.
- Same word, different thing: a website **Quest** is a public innovation bounty; a brain
  **project/task** is internal work. Name fields so they cannot be confused.

## Notes
Limits, timing expectations, auth (logged-in only? admin only?), anything the page must handle.
