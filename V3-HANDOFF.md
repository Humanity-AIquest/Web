# V3 · "Pi, the Constant" — handoff

Branch: `v3/pi-pivot` (forked from `development`; **`main` is untouched and still live**).
Safety net: tags `pre-v3-main-2026-10-01`, `pre-v3-development-2026-10-01`, and an offline bundle
`humanity-ai-web-pre-v3-2026-10-01.bundle` (in `MC Claud/backups`).

## What V3 is
Graphics and content imported into the existing code base. No framework, build or backend changes.

| Area | Change |
|---|---|
| Home (`/`) | Replaced by `HomeV3`: Pi hero, founding-campaign strip, Guard/Attest/Audit/Amend orbit, Prime Promise + 12 pledge cards, "how a rule is born", Ask-Pi chat, the long-view closing. |
| New page `?page=back` | **Back the Project**: campaign meter, what the money builds, three tiers, FAQ, GoGetFunding CTA. |
| Constitution page | Default tab = **The 12 Pledges** (full text + "Technically"). Second tab = the original 52 draft clauses, unchanged. |
| Nav / agent | "HRC Agent" renamed **Ask Pi**; greeting and backend system prompt now introduce Pi and the 12 pledges. The 52 clauses stay in the prompt as reference. |
| Legacy | `/?legacy=1` shows the previous home page for comparison or rollback. |

## Files
- NEW `src/v3/PiV3.jsx` — all V3 components + all V3 CSS (namespaced `.v3-*`).
- NEW `src/v3/pledges.js` — Prime Promise + 12 pledges (default text).
- NEW `public/pi/*.webp` — 11 locked, text-free brand images (about 380 KB total).
- EDIT `src/App.jsx` — import + one `createV3(...)` call, home/back routing, Constitution tabs, nav label changes (about 60 lines).
- EDIT `functions/api/chat.js` — system prompt prefix only.
- EDIT `index.html` — meta description only.

## Editing the words
Every visible string is an editable CMS field (`<E p="home|back|constitution" k="v3_...">`). Use Admin → CMS exactly as today.
New keys are `v3_*`, so editing them never touches the live site's existing copy.
Pledge names/one-liners on the home page: `home` → `v3_pl_I01_name` … `v3_pl_I12_line`.
Full pledge text (Constitution page) lives in `src/v3/pledges.js` (edit in code, or tell Claude).

## Funding numbers (blank until you set them)
In Admin → CMS, page `back`: `fund_goal`, `fund_raised`, `fund_backers`, `fund_currency`, `fund_url`.
Until `fund_goal` and `fund_raised` are numbers the meter shows a "goal will appear here" line. Nothing is invented.
`fund_url` defaults to the GoGetFunding campaign link already used on the site.

## Before pushing live — please check
1. Tier copy on **Back the Project** ($100 / month founding partner) matches what you will honour.
2. "1,000 year design life" and "Pi tests every idea against the pledges" are product claims; confirm you are happy to publish them.
3. The Ask-Pi chat on the home page is an illustrative example (labelled "Example").
4. Other pages (Manifesto, Your Agent, OS, Community, Ledger, About, Footer) still say "52 clauses" / "HRC Agent". Not changed in this sprint.
5. The CMS database is shared by every branch. Edits made while previewing V3 are saved to the same D1 database; only `v3_*` keys are affected.

## Run locally
```
git checkout v3/pi-pivot
npm install
npm run dev
```

## Roll back
`git checkout main` (nothing was changed there), or open `/?legacy=1` to compare.
