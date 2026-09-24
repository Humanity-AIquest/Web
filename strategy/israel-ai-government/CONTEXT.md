# Israel AI-First Government Roadmap: working context

Read this first when resuming work on the strategy in a new Claude session. It holds
the decisions already made, so they don't have to be re-derived.

## Where the documents live

| Version | Living doc (edit and comment here) | PDF |
|---|---|---|
| **V2 (current)**: *The Agentic Nation: Israel's 1% Government by 2029* | https://claude.ai/code/artifact/86fd8e79-a80f-42fa-bac9-535b783717df | [`Agentic-Nation-V2-Draft.pdf`](./Agentic-Nation-V2-Draft.pdf) (21 pp, doc rev 14) |
| V1 (superseded): *The Constitutional Nation* | https://claude.ai/code/artifact/48597a2e-6193-47cf-8475-146407911e3c | [`Constitutional-Nation-V1-Draft.pdf`](./Constitutional-Nation-V1-Draft.pdf) |

Research brief and V1 source links: [`00-research-brief-and-workplan.md`](./00-research-brief-and-workplan.md)

## Decisions made by the user (do not re-litigate)

| Decision | Answer |
|---|---|
| Who asked | **Orot Hashachar** (party running in the 27 Oct 2026 election, list led by Nissim Louk) |
| Partisanship | **Non-partisan roadmap for all parties**, offered equally and published openly |
| Build status | **Stated openly**: the firewall is designed but not running; the rules check is not built |
| Language and format | **English first**, as a living document; Hebrew later |
| V2 goal (24 Sep) | Show politicians what agents make possible, how government functions would operate, and staff/budget savings, targeting **1% of administrative staff and budget** |
| V2 content | Intro on the Trump/US "super intelligence" moves (Sep 2026) with **5 scenarios** of US-controlled SI and Israeli dependence; Israel as **"a light to the nations"** with an AI-first society by 2029; **Agentic Nation** use cases (citizens, visitors, GDP for all); **resilience** use cases (Oct 7 mass-casualty coordination, 24h epidemic quarantine requests, "no banks", plus 10 more); **remove HRC content**; focus on continuous citizen feedback and voting with **expert-weighted** input |

## V2 structure

Status · One-page answer · 1 World in 2026 (US SI, 5 scenarios) · 2 Israel's choice (light to the nations, Citizens' Charter) ·
3 How the agentic state works (personal agents, service agents, rules as code, firewall, stewards) ·
4 The 1% government (function table + savings model: NIS 15–21bn/yr net) · 5 Agentic nation use cases ·
6 Resilience and security (Oct 7, epidemics, 10 more) · 7 The people decide (public + expert tallies, delegation) ·
8 Roadmap to 2029 and workforce transition · 9 Safeguards and honest limits · Appendix (verify list, sources)

## Positions and framing to keep consistent

- The 1% applies to **administrative machinery only**, not transfers or front-line professionals (teachers, doctors, police, soldiers).
- The savings are an **illustrative model and design target**, never presented as proven.
- The US framing is factual (UNGA speech 22 Sep 2026 renaming AI "super intelligence", AI Force 19 Sep, "SICK conspiracy" 14 Sep, the June 2026 frontier-model export cut-off, Israel ranked tier 2 under the 2025 diffusion rule). It was not a literal declaration of war.
- Technology would not have prevented Oct 7; it shortens the chaos after an attack.
- Sensors: opt-in, event-type only, no voice, time-limited emergency modes.
- The Knesset stays sovereign; citizen votes create a duty to respond, binding only where delegated by law (proposed Public Voice Law).
- Workforce: attrition, redeployment, retraining, voluntary exit; no forced redundancies in pilots; negotiate with the Histadrut.

## Open items for V3

- Everything on the V2 "Still to verify" checklist (headcount, turnover, US primary sources, digital shekel status, epidemic modelling, legal basis for binding votes).
- Productivity/GDP-per-person model with the Bank of Israel.
- Hebrew translation; possibly a slide deck for politicians.

## Style rules (from CLAUDE.md)

Warm, civilizational, never corporate or AI-hype. Avoid: disrupt, revolutionize, game-changer,
supercharge, unleash, next-gen.

## PDF export

- The docs tool's own PDF export prints diagrams as raw code, so use `build-pdf.js`:
  export the doc tab as HTML into a scratch dir as `doc.html`, `npm pack mermaid@11` there (the CDN is blocked
  in cloud sessions), then `DOC_TITLE="..." DOC_HEADER="..." node build-pdf.js out.pdf`.
- Regenerate the PDF after every round of edits; the living doc is the source of truth.
