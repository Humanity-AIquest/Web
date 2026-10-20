# Web Repo Index — Where Everything Lives (public)

**Trailer.** A map of this public repository: its documents, code areas and public URLs. Internal
documents (team roles, doc standard, briefs, endpoint contracts, specs) live in the project brain
and the internal Drive, never here.

Antony sign-off: I agree this context is aligned to import. Signed by: ____ Date: ____
(Treated as signed on Antony's instruction, 20 Oct 2026.)

<details><summary>Document context block (AGENTI CONTEXT BLOCK v3.1)</summary>

```
=== AGENTI CONTEXT BLOCK v3.1 ===
doc_id: AGNT-V3-WEB-IDX-001
title: Web Repo Index (public)
kind: INDEX
version: v3.1.1
status: SIGNED_OFF
owner: antony (staff_tony)
author: claude_code
confidentiality: PUBLIC
context_summary: Index of the public Web repo's documents, code areas and public URLs.
key_facts:
  - F1: The repo is public; internal context is fetched from the brain, not stored here.
rules_for_agents:
  - Add a row here in the same commit as any new doc or code area.
open_questions:
  - Q1: Public URL of the brain context endpoint.
stamp: sha256:[computed by the brain at sign-off; never typed]
=== END CONTEXT BLOCK ===
```
</details>

## Documents in this repo
| File | What it is |
|---|---|
| [`../README.md`](../README.md) | What the site is, local dev, deployment, troubleshooting |
| [`../CLAUDE.md`](../CLAUDE.md) | Briefing for Claude Code (web front-end developer) |
| [`../SCHEMA.md`](../SCHEMA.md) | Database tables and API endpoints (ground truth) |
| [`contracts/_TEMPLATE.md`](./contracts/_TEMPLATE.md) | Blank endpoint-contract template (filled contracts are internal) |

## Code map
| Path | What lives there |
|---|---|
| `src/App.jsx` | Public site: pages, constitution explorer, Uto-Pi chat UI |
| `src/v3/` | V3 home, Back the Project, Quest OS, the 12 pledges |
| `src/AdminDashboard.jsx` | Admin console |
| `functions/api/chat.js` | Agent proxy (model called server-side) |
| `functions/api/**` | Backend endpoints: auth, ideas, petition, surveys, quests, events, CMS |
| `functions/api/admin/**` | Admin-only endpoints |
| `public/` | Static files and brand images |

## Public URLs
| What | Where |
|---|---|
| Live site | https://humanity-ai.quest (auto-deploys from `main`) |
| Bugs and tasks | GitHub issues on this repo (describe symptoms only; no internal detail) |

## Summary card
Three documents, one template, the code map and the live URL. Everything else is internal.

## Version change log
| Version | Date | Source | What changed |
|---|---|---|---|
| v3.1.1 | 2026-10-20 | claude_code | Public-safe index; internal docs moved out of the repo |

## Owen's Brain (legal, IP, security, money and TOC check)
[To be completed by Owen / Antony.] No secrets or internal links are listed here.

## Minutes
| Date | Context_resync meeting | What it changed |
|---|---|---|
| | | |

## Agent reminder notes
- [2026-10-20 · claude_code] LEARNED: keep this index public-safe. NEXT TIME: link internal
  material only through the brain. DO NOT: add Drive links or internal URLs here.
