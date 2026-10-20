# Humanity-AI.Quest — Website (V3)

**Trailer.** The public website for **humanity-ai.quest**: the home of the Humanity Rights
Constitution (one Prime Promise and twelve Hippocratic pledges) and its guardian agent,
**Uto-Pi** ("Ask Pi"). React + Vite on Cloudflare Pages, with Pages Functions and a D1 database
for accounts, petition, ideas, surveys, quests, events and the admin CMS. This README explains
what the site is, how to run it, and how it is deployed.

> **This repository is public.** It holds no secrets and no internal team documents. API keys
> live only in Cloudflare's encrypted environment variables. Project context for agents lives in
> the project brain, which refuses any connection without a pre-registered, hashed client
> certificate: **https://mcp.agenti-pm.work** (for registered agents only; it is not part of the public site).

Antony sign-off: I agree this context is aligned to import. Signed by: ____ Date: ____
(Treated as signed on Antony's instruction, 20 Oct 2026.)

<details><summary>Document context block (AGENTI CONTEXT BLOCK v3.1)</summary>

```
=== AGENTI CONTEXT BLOCK v3.1 ===
doc_id: AGNT-V3-WEB-README
title: Humanity-AI.Quest — Website README
kind: README
version: v3.1.2
status: SIGNED_OFF
owner: antony (staff_tony)
author: claude_code
confidentiality: PUBLIC
context_summary: Public README for the humanity-ai.quest website: what V3 contains, local dev,
  deployment on Cloudflare Pages, secrets handling, operations and troubleshooting.
key_facts:
  - F1: Push to main auto-deploys humanity-ai.quest via Cloudflare Pages (build: npm run build, output: dist).
  - F2: The agent calls /api/chat; the Anthropic key is a server-side secret and never reaches the browser.
  - F3: The repo is public: no secrets, no internal docs.
rules_for_agents:
  - Read this block first. Internal context comes from the brain, never from this repo.
open_questions:
  - Q1: none.
stamp: sha256:[computed by the brain at sign-off; never typed]
=== END CONTEXT BLOCK ===
```
</details>

## Summary card
| | |
|---|---|
| **What** | The public website and its backend (Cloudflare Pages + Functions + D1) |
| **Live** | https://humanity-ai.quest — every push to `main` deploys automatically |
| **Agent** | Uto-Pi ("Ask Pi"), served by `functions/api/chat.js` (Anthropic API, server-side) |
| **Cost** | Hosting $0 (Cloudflare free tier); the AI model is pay-per-use |

## What's on the site (V3)
| Page (`?page=`) | What it is |
|---|---|
| `home` (Genesis) | Pi hero, founding campaign, Guard / Attest / Audit / Amend, the Prime Promise and 12 pledges, how a rule is born, Ask Pi |
| `constitution` | Tab 1: the 12 pledges in full. Tab 2: the original 52 draft clauses |
| `back` | Back the Project: campaign meter (blank until goal and raised are set in the CMS), tiers, FAQ |
| `petition` | Sign the founding petition, with a live signatory count |
| `quest` | Quest OS: prize quests, startup quests and crowd campaigns; pitch and Q&A |
| `surveys` | pol.is-style statements: agree / disagree / pass, one vote per person |
| `events` | Pitch and networking events with RSVP |
| `agent` · `os` · `community` · `ledger` · `manifesto` · `join` · `about` · `media` · `courses` · `terms` | Explainer, onboarding and policy pages |
| `account` | The signed-in member's account |
| `admin` | Admin console (admin role and ACL level required): members, ideas, CMS, quests, surveys, events |

A demo notice on every public page says which parts are live and which are demonstrations.
`/?legacy=1` shows the pre-V3 home page for comparison.

## Run it locally
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into dist/
```
Requires Node 20+. The agent and database endpoints only work when deployed (or with
`wrangler pages dev`), because they run as Cloudflare Pages Functions.

## Project structure
```
functions/api/      Cloudflare Pages Functions (the backend), routed by file name
  chat.js           Uto-Pi agent proxy: guardrails, memory, model call
  auth/  admin/  quests/  surveys/  events/  ideas.js  sign.js  count.js  content.js
src/
  App.jsx           Public site (pages, constitution explorer, agent chat UI)
  v3/               V3 home, Back the Project, Quest OS, the 12 pledges
  AdminDashboard.jsx  Admin console
public/             Static files, including the Pi brand images
SCHEMA.md           Database tables and API endpoints
```

## Deployment (Cloudflare Pages)
1. **Build settings:** framework Vite, build command `npm run build`, output directory `dist`.
2. **Database:** a D1 database bound as `DB`. Tables create themselves on first use.
3. **Secrets** (Cloudflare → Pages project → Settings → Environment variables, encrypted):
   - `ANTHROPIC_API_KEY`: required for the agent.
   - `ZEPTOMAIL_TOKEN`, `EMAIL_FROM`, `EMAIL_FROM_NAME`: email (optional).
   - `ZOHO_*`: CRM (optional).
   - `AGENTI_ADMIN_URL`: the Agenti admin shell shown in the admin console's Agenti tab (optional;
     served only to signed-in admins by `/api/admin/agenti`, never built into the public bundle).
   Missing optional secrets are safe: those features simply switch off.
4. **Never commit a key.** If one is ever committed, rotate it at the provider immediately;
   deleting the commit is not enough on a public repo.

A separate staging deployment exists for testing against its own database. It is set up
differently (a Cloudflare Worker), so changes there follow their own steps.

## Operating the site
- **Update:** commit on a branch, open a pull request; after review it is merged to `main` and
  deploys in about 90 seconds.
- **Edit words:** most visible text is editable in Admin → CMS without a code change.
- **Change the agent's behaviour:** `functions/api/chat.js` (system prompt and guardrails).
- **Monitor:** Cloudflare → Analytics for visitors; the model provider's console for AI spend.
  Set a spending limit there.

## Troubleshooting
- **Agent says it can't reach the constitution layer:** check `ANTHROPIC_API_KEY` is set for
  Production, then redeploy. Function logs: Cloudflare → Pages → project → Functions.
- **`Cannot read properties of undefined (reading 'prepare')`:** the D1 binding is missing or not
  named `DB`.
- **Build fails:** use Node 20+, run `npm install` again, and check the output directory is `dist`.

## Version change log
| Version | Date | Source | What changed |
|---|---|---|---|
| v3.1.2 | 2026-10-20 | claude_code (Antony answers) | Brain link added; `AGENTI_ADMIN_URL` setting; stale files and committed build output removed; superseded docs archived |
| v3.1.1 | 2026-10-20 | claude_code (Antony instruction) | Rewritten for the V3 site and the V3 doc standard; internal notes removed (public repo) |
| v1 | 2026-05 | original | First deployment guide (10 pages, HRC Agent) |

## Owen's Brain (legal, IP, security, money and TOC check)
[To be completed by Owen / Antony.] Security note: no secrets are stored in this repository.

## Minutes
| Date | Context_resync meeting | What it changed |
|---|---|---|
| | | |

## Agent reminder notes
- [2026-10-20 · claude_code] LEARNED: this repo is public. NEXT TIME: put internal context in the
  brain or Drive and link to it. DO NOT: commit secrets, internal docs or Drive links here.
