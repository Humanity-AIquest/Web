# Humanity-AI.Quest — Claude Code briefing (V3)

**Trailer.** Session briefing for Claude Code, the web front-end developer on this repo. It says
what the site is, the product goal, the stack and conventions, and the deployment setup. This repo
is **public**: nothing internal or secret belongs in it, including in this file.

Antony sign-off: I agree this context is aligned to import. Signed by: ____ Date: ____
(Treated as signed on Antony's instruction, 20 Oct 2026.)

<details><summary>Document context block (AGENTI CONTEXT BLOCK v3.1)</summary>

```
=== AGENTI CONTEXT BLOCK v3.1 ===
doc_id: AGNT-V3-WEB-CLAUDE
title: Claude Code briefing for the Web repo
kind: AGENT_INSTRUCTIONS
version: v3.1.2
status: SIGNED_OFF
owner: antony (staff_tony)
author: claude_code
confidentiality: PUBLIC
context_summary: Orientation for Claude Code on the humanity-ai.quest website: role, working rules,
  product goal, stack, conventions and deployment. Internal context is fetched, never stored here.
key_facts:
  - F1: Claude Code is the web front-end developer; the brain is built by another agent.
  - F2: The repo is public: no secrets, no internal docs, no Drive links.
  - F3: Push to main auto-deploys the live site; work on a branch and open a PR; Antony merges.
rules_for_agents:
  - Read this block first, then fetch internal context from the brain or the internal Drive.
open_questions:
  - Q1: none.
stamp: sha256:[computed by the brain at sign-off; never typed]
=== END CONTEXT BLOCK ===
```
</details>

## What this is
The website **and backend** for **Humanity-AI.Quest**: the home of the **Humanity Rights
Constitution** (one Prime Promise and twelve Hippocratic pledges; the original 52 draft clauses
are kept on a second tab) and its guardian agent **Uto-Pi** (hyphenated, "Pi" for short, "Ask Pi"
in the nav; never write "Utopi"). It has user accounts, a moderated agent chat with memory, an idea
ledger, a petition, pol.is-style surveys, quests, events, a CRM hook, a CMS and an admin console,
all on Cloudflare (Pages Functions + D1).

> **Data model and API:** see [`SCHEMA.md`](./SCHEMA.md). Keep it in sync when the schema changes.

---

## Your role and working rules
- **You are the web front-end developer.** Pages, UI design, dashboard upgrades, mockups,
  full-screen workspaces, link health, and wiring pages to the brain's endpoints; you help debug.
  You do **not** build brain logic. Work on a branch, open a PR; a QA agent reviews; Antony merges.
- **Internal context is not in this repo.** Team roles, the document standard (AGNT-V3-STD-001),
  briefs, endpoint contracts and sprint specs live in the project brain and the internal Google
  Drive build folder ("3.0 signed off Docs for build"). Read them there (Google Drive connector).
  Brain context endpoint (agents only): https://mcp.agenti-pm.work. It refuses connections without a
  pre-registered, hashed client certificate. The public site's browser code never calls it.
- **Public-repo rule:** never commit secrets, internal docs, Drive links, internal rosters or
  anything marked INTERNAL. Check repo visibility before committing any document.
- **Keep data domains apart.** Website members, website Quests (public innovation bounties) and
  site content are *website* data in D1. Brain users, projects, tasks and minutes are *brain* data.
  Every contract names its data domain and tenant, IDs are never shared across domains, and
  internal brain data (minutes, staff, agent sessions) is never shown on public pages.
- **Brain ↔ site integration** goes through endpoint contracts agreed with the brain's builder
  (template: `docs/contracts/_TEMPLATE.md`; filled contracts live in Drive). Build against sample
  data matching an agreed contract; never change an agreed contract alone.
- **Antony is new to development:** explain changes in plain language, coaching style.
- **Links for approvals:** whenever you ask Antony to approve, review or sign off a document, give
  its direct link in the same message.
- **Doc-standard check on open:** when you open a document, check it against AGNT-V3-STD-001 and
  add any missing fields (trailer, sign-off block, Context Block, Version Change Log, Summary
  Card, Owen's Brain, Minutes, Agent Reminder Notes). In Google Docs, only as suggestions; use
  `[placeholder]` for unknowns. Every update is saved at a higher version number.
- **Role changes:** add a "Since this document was written" notice (as a suggestion) to every doc
  in the internal Drive build folder.

The "North star" below is the product goal. The agent's memory and idea logic are built in the
brain; your part is the interface to it.

## North star: the Agent IS the interface
The short-term goal is for the **constitutional Agent to become the primary UI to the site** —
not a chat widget bolted onto pages, but the front door. A person should be able to *talk to the
constitution*, and everything else (reading clauses, submitting ideas, voting, joining) should be
reachable through that conversation.

The Agent is a **constitutional agent** with three defining jobs:

1. **Memory.** It remembers each user's past conversations across sessions, it can search for similar ideas by
Other members and debate the difference. A returning member is
   greeted with continuity, not a blank slate — the agent can recall what they proposed, what they
   care about, and where their idea is in the pipeline. *(Data: `conversations` + `messages` keyed
   by `user_id`; `interactions` is the unified per-user activity index.)*

2. **Idea coalition.** As people converse, the agent helps them shape **ideas for the HRC** —
   proposed clauses, amendments, refinements. Ideas are captured, hashed into an immutable ledger,
   and moved through a review pipeline. Once an idea is **approved**, the agent *collates* related
   approved ideas rather than leaving them as scattered submissions. *(Data: `ideas` with
   `ledger_hash`/`prev_hash` chain + `clause_refs`; lifecycle in `idea_status_log`.)*

3. **Community voting.** The agent **presents approved ideas back to the community for a vote**,
   using the pol.is-style deliberation mechanism (agree / disagree / pass, one vote per person per
   statement). The community's signal is what decides whether an idea becomes a candidate clause.
   *(Data: `surveys` → `survey_statements` → `survey_votes`.)*

This closes a civic loop: **converse → propose → (admin) approve → collate → community vote →
clause.** When designing any feature, ask "does this route through the agent, feed its memory, or
move an idea along this loop?" The pages that exist today are the scaffolding; the agent is the
destination.

### Implications for how we build
- **Prefer the agent path.** New capabilities should be reachable through conversation, not only
  through a page. Pages remain as fallback/SEO/deep-links, but the agent is the intended entry.
- **Everything is remembered and attributable** (except deliberately anonymous survey votes).
  A "member" is keyed by lowercased email across signatures, pitches, RSVPs, and accounts.
- **The idea pipeline is real state, not a form.** Respect `status` transitions and always log to
  `idea_status_log`. "Approved" is the gate that lets an idea be collated and put to a vote.
- **Voting is sacred.** Preserve `UNIQUE(statement_id, voter)` — one person, one vote per
  statement.

---

## Stack
- **Frontend**: React 18, Vite, Lucide React icons. Almost all public UI is in `src/App.jsx`;
  the admin console is `src/AdminDashboard.jsx`.
- **Styling**: CSS custom properties in a `<style>` tag (`var(--aurora)`, etc.) **plus Tailwind
  utility classes**, loaded from the Tailwind CDN in `index.html`. V3 components in `src/v3/`
  use namespaced `.v3-*` CSS.
- **Fonts**: Fraunces (display serif), Manrope (body sans-serif) via Google Fonts.
- **Backend**: Cloudflare **Pages Functions** under `functions/api/**` (file-based routing) — true
  for this (Web) repo. **The Staging repo is a different Cloudflare product (a Worker) and routes
  these same files manually — see "Deployment environments" below before assuming Pages semantics
  apply everywhere.**
- **Database**: Cloudflare **D1** (SQLite), bound as `env.DB`. Schema self-migrates on first use.
- **Entry point**: `index.html` loads `/src/main.js`. Build output (`dist/`) is not committed;
  Cloudflare builds it on deploy.
- **AI**: Anthropic Messages API, called **server-side only** from `functions/api/chat.js`.
  Model constant `claude-sonnet-4-6`, `max_tokens: 2000`. The API key never reaches the browser.
- **Email**: Zoho ZeptoMail HTTP API (`functions/api/_email.js`) — guarded, no-ops until secrets set.
- **CRM**: Zoho CRM leads (`functions/api/_zoho.js`) — guarded, no-ops until secrets set.
- **Hosting**: Cloudflare Pages (free tier). **Domain**: humanity-ai.quest

## Project structure
```
humanity-ai-quest/
├── functions/api/
│   ├── chat.js                 ← Agent proxy: guardrails, memory, Anthropic call
│   ├── _shared.js              ← CORS, JSON, password hashing, getUser, requireACL, newId
│   ├── _conversations.js       ← conversations/messages/interactions schema + logInteraction
│   ├── _movement.js            ← petition/quests/surveys/events schema + seed data
│   ├── _email.js  _zoho.js     ← ZeptoMail + Zoho CRM integrations (guarded)
│   ├── auth/                   ← signup, login, logout, me
│   ├── ideas.js  sign.js  count.js  content.js
│   ├── quests/  surveys/  events/   ← public movement endpoints
│   └── admin/                  ← ACL-gated console API (members, conversations, ideas, …)
├── src/
│   ├── App.jsx                 ← Public site: pages, constitution explorer, Uto-Pi chat
│   ├── v3/                     ← PiV3.jsx (home, Back the Project), QuestV3.jsx, pledges.js
│   ├── AdminDashboard.jsx      ← Admin console (consumes /api/admin/*)
│   ├── useTTS.jsx              ← Agent text-to-speech
│   └── main.js                 ← Entry point
├── SCHEMA.md                   ← Full DB + API reference (source of truth)
├── CLAUDE.md                   ← This file (orientation + intent)
├── index.html · package.json · vite.config.js
```

## Architecture decisions
- **Self-migrating schema.** There is **no `.sql` migration file**. Tables are created via
  `CREATE TABLE IF NOT EXISTS` and columns via idempotent `ALTER TABLE … ADD COLUMN` in try/catch.
  Canonical DDL modules: `_movement.js` and `_conversations.js`. When you add a table/column, do it
  the same way (idempotent, on first request) **and update `SCHEMA.md`**.
- **`users` and `sessions` self-migrate via `ensureAuthSchema(env)`** in `_shared.js` (called at the
  top of `auth/login.js`, `auth/signup.js`, `auth/me.js`), same idempotent
  `CREATE TABLE IF NOT EXISTS` pattern as `_movement.js`/`_email.js`. (This function was missing
  entirely until 2026-09 — a real bug that silently broke all three auth endpoints; if you see it
  missing again, check whether an old file version got reintroduced.)
- **Errors return HTTP 200** with an `{ error }` body by design, so the frontend always parses.
- **No enforced foreign keys.** Relationships are by convention (see the map in SCHEMA.md).
  `interactions` and `admin_actions` are polymorphic pointer/audit logs.
- **Single-file front end (for now).** The public site lives in `src/App.jsx` — intentional for
  the MVP: simple and greppable. As it grows, split into `src/pages/`, `src/components/`, `src/data/`.
- **No localStorage.** Front-end state is in-memory React; persistence is the D1 backend.

## Authentication & ACL
- Salted **SHA-256** passwords via Web Crypto (`hashPassword`/`verifyPassword`).
- 30-day sessions: 64-hex token in the `hrc_session` cookie or `Authorization: Bearer`.
- **ACL levels** (`acl_level`, only meaningful when `role === 'admin'`): 0 user · 1 viewer ·
  2 moderator · 3 editor · 4 manager · 5 super admin.
- **ACL rule:** `requireACL(user, min)` passes only when **`role === 'admin'` AND
  `acl_level >= min`** — both conditions. It is written as the equivalent *negated guard*:
  ```js
  if (user.role !== "admin" || user.acl_level < minLevel) return 403;
  ```
  That `||` is correct (De Morgan of the rule above). **Do not "fix" it to `&&`** — that inverts
  the rule and lets any admin, even L1, perform L5 actions. This has regressed before.

## Key color palette (V3, from `:root` in `src/App.jsx`)
- `--void`: #0F1F3A (navy background) · `--void-2`: #16284A · `--cosmos`: #1E3358 (sections)
- `--bone`: #FFFFFF (primary text) · `--bone-dim`: #C5CDDD
- `--aurora` / `--gold`: #FFD60A (primary accent, yellow) · `--aurora-deep`: #E0B800 · `--bronze`: #CC9000
- `--terra`: #E0A458 · `--forest`: #234555 · `--dust`: #8693AD

## Constitution data
V3 shows **the Prime Promise and 12 pledges** by default (`src/v3/pledges.js`; home-page names
and lines are CMS fields). The original 52 draft clauses are stored as three arrays at the top of `src/App.jsx`, which must be editable via the Admin CMS page:
- `HRC_CORE` — 33 Core Rights & Protections (Section I)
- `HRC_GOV` — 10 Governance & Evolution (Section II)
- `HRC_OPS` — 9 Operational Mandates (Section III)

Each clause is `{ n: number, t: title, s: summary, r: reasoning }`. The community-voting loop is
how *new* clauses are meant to enter this set — approved ideas become candidate clauses put to a vote.

## The agent (Uto-Pi, "Ask Pi")
- Chat UI in `src/App.jsx` (call-style Uto-Pi panel); TTS via `src/useTTS.jsx`. The system
  prompt introduces Pi and the 12 pledges, with the 52 clauses as reference.
- Known bug to fix: the agent chat pane has no scroll bar or top/bottom buttons.
- Calls `/api/chat` (the Cloudflare Function `functions/api/chat.js`), which:
  1. runs **input guardrails** (DB `guardrail_rules` if present, else hardcoded fallback) —
     blocked messages are still logged, flagged, and answered with a dignity-grounded refusal;
  2. builds the system prompt via `buildSystemPrompt()` — embeds all 52 clauses; the agent is
     in-character as the conversational embodiment of the constitution;
  3. reuses the client-supplied `conversation_id` so multi-turn chats stay one thread (**this is
     the memory primitive** — build on it toward true cross-session recall);
  4. calls Anthropic and **persists both turns** to `messages`, then appends to `interactions`.
- **Toward the north star:** memory today is per-thread; the goal is per-user recall across
  sessions, agent-driven idea capture, and agent-surfaced approved ideas for voting.

## Pages (V3, `?page=` ids from `PAGES` in `src/App.jsx`)
`home` (Genesis) · `petition` · `back` (Back the Project) · `constitution` (12 pledges + 52-clause
tab) · `quest` (Quest OS) · `surveys` · `events` · `agent` · `os` · `community` · `ledger` ·
`manifesto` · `join` · `about`, plus `media`, `courses`, `terms`, `account`, `admin`.
A demo notice on every public page marks what is live. `/?legacy=1` shows the pre-V3 home.
Treat pages as scaffolding around the agent, not the product's ceiling.

## Design principles
- **Tone**: Civilizational, warm, manifesto-grade. Never corporate. Never AI-hype.
- **Visual**: Organic-futurist meets cinematic sci-fi. Biomorphic forms, aurora light,
  planetary nervous system.
- **Forbidden words**: disrupt, revolutionize, game-changer, supercharge, unleash, next-gen
- **Preferred words**: constitution, sovereignty, gift, commons, lineage, dignity, partnership,
  ledger, oath, planet, peace, truth, biodiversity, agent, quest, humanity

## Commands
```bash
npm install       # Install dependencies
npm run dev       # Dev server at localhost:5173
npm run build     # Production build to dist/
```

## Deployment environments — two separate repos, two different architectures

**This project deploys from TWO separate GitHub repos, not two branches of one repo.**
Uploading/pushing to the wrong one has caused real outages — read this before touching either.

| | **Web** (production) | **Staging** |
|---|---|---|
| Repo | `Humanity-AIquest/Web` | `Humanity-AIquest/Staging` (separate repo!) |
| Branch | `main` | `main` |
| URL | https://humanity-ai.quest | https://staging.humanity-ai-info.workers.dev |
| Cloudflare product | Classic **Pages** project | Genuine **Worker** (despite living under the "Workers & Pages" dashboard section — confirmed by the `.workers.dev` URL pattern and `wrangler pages deploy` reporting "Project not found" when tried) |
| `functions/api/*.js` routing | **Automatic** — Pages auto-generates the router from the file tree | **Manual** — `src/index.js` is a hand-written router that imports every handler and dispatches by path. **If you add/rename/move a file under `functions/api/`, you must also update `src/index.js` on Staging**, or the new route silently 404s. Web needs no such update. |
| Config file | none committed (D1 binding set via Cloudflare dashboard) | `wrangler.jsonc` (committed) — `main`, `assets` block, `d1_databases`, `kv_namespaces` |
| Deploy command (Cloudflare dashboard → Settings → Build configuration) | n/a (Pages auto-deploys after build) | `npx wrangler deploy` — **must** be this, not `wrangler deploy` alone (fails: "Missing entry-point" before `main`/`assets` existed) and not `wrangler pages deploy` (fails: "Project not found" — this is not a Pages project) |
| D1 binding name in code | `env.DB` | `env.DB` (same name deliberately — code is meant to be near-identical between repos) pointing to the separate `humanity-ai-db-staging` database |

**Recurring failure mode to watch for:** code has repeatedly gotten cross-contaminated between
these repos — e.g. a local-dev-only `wrangler.toml` from the Web repo's gitignored file, or a
one-off binding rename, ending up committed to Staging via a manual "Add files via upload." If a
function suddenly throws `Cannot read properties of undefined (reading 'prepare')`, grep the repo
you're in for a binding name that doesn't match its own `wrangler.jsonc`/dashboard config before
assuming it's a code bug.

Staging deploy credentials and their renewal dates are internal: see the brain / internal Drive.

- Push to `main` on **Web** auto-deploys via Cloudflare Pages. Build command `npm run build`, output dir `dist`.
- Secrets (Cloudflare dashboard, encrypted env vars, set separately per project): `ANTHROPIC_API_KEY`
  (required for the agent); `ZEPTOMAIL_TOKEN` / `EMAIL_FROM` / `EMAIL_FROM_NAME` (email); `ZOHO_*`
  (CRM); `AGENTI_ADMIN_URL` (Agenti tab, served to admins only via `/api/admin/agenti`). Missing integration secrets fail safe — the app keeps working, those features just no-op.
- `DB` is the D1 binding on both Web and Staging.

## Important notes
- The agent calls `/api/chat`, **not** Anthropic directly — the proxy adds the API key server-side.
- **Update `SCHEMA.md` whenever you change the database or API.** Regenerate its map by grepping the
  Functions for `CREATE TABLE`, `ALTER TABLE`, and `env.DB.prepare(`.
- Seed/mock data exists (3 quests, 2 surveys, 3 events, default email templates) — replace with real
  data as the movement grows.
- The newest clause is I.33 "Right to Truthful Media & Pro-Humanity Content" (cross-refs I.4, I.12, II.4).

## Version change log
| Version | Date | Source | What changed |
|---|---|---|---|
| v3.1.2 | 2026-10-20 | claude_code (Antony answers) | Brain link; data-domain rule; `AGENTI_ADMIN_URL`; stale files and `dist/` removed |
| v3.1.1 | 2026-10-20 | claude_code (Antony instruction) | V3 facts (Uto-Pi, 12 pledges, pages, palette, Tailwind, entry point); role as web front-end developer; public-repo rule; internal detail removed |
| pre-V3 | 2026-09 | earlier sessions | 10-page site, HRC Agent, original palette |

## Owen's Brain (legal, IP, security, money and TOC check)
[To be completed by Owen / Antony.] Security: no secrets in this repo; keys only in Cloudflare.

## Minutes
| Date | Context_resync meeting | What it changed |
|---|---|---|
| | | |

## Agent reminder notes
- [2026-10-20 · claude_code] LEARNED: the repo is public and internal docs had been committed to
  a working branch. NEXT TIME: check visibility first; keep internal context in the brain/Drive.
  DO NOT: commit Drive links, rosters, contracts with internal endpoints, or INTERNAL mirrors.
