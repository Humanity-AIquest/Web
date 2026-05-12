# CLAUDE.md — Humanity-AI.Quest

## What this project is

This is the website for **humanity-ai.quest** — the constitutional AI Operating System governed by the Humanities-AI Rights Constitution (HRC), the "Hippocratic Oath for AI." It is a React + Vite single-page application deployed to Cloudflare Pages.

## Commands

- `npm run dev` — Start dev server (http://localhost:5173)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview the production build locally

## Architecture

- **Framework**: React 18 + Vite 5 (single-page app, no router library — pages are state-driven)
- **Styling**: All CSS is in a `<style>` tag inside `GlobalStyles` component in App.jsx. CSS custom properties (variables) define the design system. No Tailwind, no external CSS files.
- **Fonts**: Fraunces (display serif) and Manrope (body sans) loaded from Google Fonts.
- **Icons**: lucide-react
- **Deployment**: Cloudflare Pages with a Pages Function at `functions/api/chat.js` that proxies the Anthropic API securely (API key is an environment variable in Cloudflare, never in code)
- **HRC Agent**: Live chat powered by the Anthropic Messages API via the proxy function. System prompt contains all 52 HRC clauses.

## File structure

```
humanity-ai-quest/
├── functions/api/chat.js   ← Cloudflare Pages Function (Anthropic API proxy)
├── public/favicon.svg
├── src/
│   ├── App.jsx             ← The entire website (all pages, components, data)
│   └── main.jsx            ← React entry point
├── index.html
├── package.json
├── vite.config.js
└── CLAUDE.md               ← This file
```

## Key data structures (top of App.jsx)

- `HRC_CORE` — array of 33 Core Rights & Protections clauses (objects with n, t, s, r)
- `HRC_GOV` — array of 10 Governance & Evolution clauses
- `HRC_OPS` — array of 9 Operational Mandates clauses
- `PAGES` — array of page definitions (id, name) used for navigation

## Design system

All colors are CSS custom properties defined in `:root`:
- `--void` (#07101F) — primary background
- `--bone` (#F2EAD3) — primary text
- `--aurora` (#5BE9DD) — accent / interactive / agent
- `--gold` (#E8B14F) — secondary accent / constitutional gravitas
- `--terra` (#C97B5B) — tertiary accent / warmth

## Page structure

The app renders pages via state: `const [page, setPage] = useState('home')`.
Pages: home, constitution, quest, agent, os, community, ledger, manifesto, join, about.
Each page is a separate component function (HomePage, ConstitutionPage, QuestPage, etc.).

## Conventions

- Display headings use `font-display` class (Fraunces serif)
- Body text uses `font-body` class (Manrope sans)
- Cards use `card-glass` class (frosted glass effect)
- HRC clause cards use `clause-card` class
- Buttons: `btn-primary`, `btn-secondary`, `btn-aurora`, `btn-gold`
- Section labels use the `SectionLabel` component
- The `AgentNetwork` component renders the animated SVG background

## Tone

- Civilizational, warm, confident. Never corporate or startup-speak.
- Words to use: constitution, sovereignty, gift, commons, lineage, dignity, partnership, ledger, oath, planet, peace, truth, biodiversity, agent, quest, humanity.
- Words to avoid: disrupt, revolutionize, game-changer, supercharge, unleash, next-gen.

## When editing

- All content, components, and styles live in `src/App.jsx`. This is intentional — the site is a single living artifact.
- When adding a new HRC clause, add it to the appropriate array (HRC_CORE, HRC_GOV, or HRC_OPS), update clause counts in text throughout the site, and update the agent's system prompt in `buildSystemPrompt()`.
- The HRC Agent's system prompt is built dynamically from the clause arrays, so new clauses are automatically available to the agent.
- Commit messages should be meaningful (e.g., "Add Clause I.34 on Right to Be Forgotten") — they appear in Cloudflare's deployment history and are how we find rollback points.
