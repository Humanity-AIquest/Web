# Humanity-AI.Quest

## What this is
The website for **Humanity-AI.Quest** — the constitutional AI Operating System governed by the Humanities-AI Rights Constitution (HRC), described as the "Hippocratic Oath for AI."

This is a React + Vite single-page app with 10 pages, an interactive HRC clause explorer (52 clauses), and a live HRC Agent chat powered by the Anthropic API via a secure Cloudflare Pages Function proxy.

## Stack
- **Frontend**: React 18, Vite, Lucide React icons
- **Styling**: CSS-in-JS via `<style>` tag in GlobalStyles component (no Tailwind, no external CSS files)
- **Fonts**: Fraunces (display serif), Manrope (body sans-serif) via Google Fonts
- **Backend**: Cloudflare Pages Function at `functions/api/chat.js` proxying to Anthropic API
- **Hosting**: Cloudflare Pages (free tier)
- **Domain**: humanity-ai.quest

## Project structure
```
humanity-ai-quest/
├── functions/api/chat.js   ← Secure Anthropic API proxy (server-side only)
├── public/favicon.svg
├── src/
│   ├── App.jsx             ← THE ENTIRE WEBSITE (all pages, components, data)
│   └── main.jsx            ← Entry point
├── index.html
├── package.json
├── vite.config.js
└── CLAUDE.md               ← This file
```

## Architecture decisions
- **Single-file architecture**: The entire site lives in `src/App.jsx` for now. This is intentional for the MVP — it keeps the project simple and greppable. As features grow, split into `src/pages/`, `src/components/`, `src/data/`.
- **No Tailwind**: All styling uses CSS custom properties defined in the GlobalStyles component. Colors use CSS variables like `var(--aurora)`, `var(--bone)`, `var(--void)`.
- **No localStorage**: React state only. All data is in-memory during the session.

## Key color palette
- `--void`: #07101F (deep space background)
- `--bone`: #F2EAD3 (primary text)
- `--aurora`: #5BE9DD (primary accent — cyan)
- `--gold`: #E8B14F (secondary accent)
- `--terra`: #C97B5B (tertiary accent)
- `--forest`: #1B3B2F (earth green)
- `--cosmos`: #131F32 (section backgrounds)

## HRC data
All 52 clauses are stored as three arrays at the top of App.jsx:
- `HRC_CORE` — 33 Core Rights & Protections (Section I)
- `HRC_GOV` — 10 Governance & Evolution (Section II)
- `HRC_OPS` — 9 Operational Mandates (Section III)

Each clause is `{ n: number, t: title, s: summary, r: reasoning }`.

## The HRC Agent
- Chat UI component `HRCAgent` at bottom of App.jsx
- Calls `/api/chat` which is the Cloudflare Pages Function in `functions/api/chat.js`
- System prompt is built by `buildSystemPrompt()` — includes all 52 clauses
- The agent is in-character as the conversational embodiment of the constitution

## Pages (10 total)
1. `home` — Genesis / landing
2. `constitution` — Interactive HRC explorer with filters and expandable clauses
3. `quest` — Shark Tank–style pitch competition
4. `agent` — Your Personal Agent explainer
5. `os` — The OS architecture
6. `community` — Builder profiles, HRC Houses, university cohorts
7. `ledger` — Humanity's patent ledger
8. `manifesto` — Long-form manifesto + pledge
9. `join` — Three-door onboarding
10. `about` — Origin, governance, contact

## Design principles
- **Tone**: Civilizational, warm, manifesto-grade. Never corporate. Never AI-hype.
- **Visual**: Organic-futurist meets cinematic sci-fi. Biomorphic forms, aurora light, planetary nervous system.
- **Forbidden words**: disrupt, revolutionize, game-changer, supercharge, unleash, next-gen
- **Preferred words**: constitution, sovereignty, gift, commons, lineage, dignity, partnership, ledger, oath, planet, peace, truth, biodiversity, agent, quest, humanity

## Commands
```bash
npm install       # Install dependencies
npm run dev       # Dev server at localhost:5173
npm run build     # Production build to dist/
```

## Deployment
- Push to `main` branch auto-deploys via Cloudflare Pages
- `ANTHROPIC_API_KEY` is set as an encrypted environment variable in Cloudflare dashboard
- Build command: `npm run build`, output dir: `dist`

## Important notes
- The HRC Agent chat calls `/api/chat` (not the Anthropic API directly) — the proxy in `functions/api/chat.js` adds the API key server-side
- Mock data exists for signatories count, ledger entries, builder profiles, and Quest finalists — replace with real data when ready
- The newest clause is I.33 "Right to Truthful Media & Pro-Humanity Content" — it cross-references I.4, I.12, and II.4
