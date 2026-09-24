# Israel AI-First Government Roadmap: working context

Read this first when resuming work on the strategy in a new Claude session. It holds
the decisions already made, so they don't have to be re-derived.

## Where the document lives

- **Living draft (edit and comment here):** https://claude.ai/code/artifact/48597a2e-6193-47cf-8475-146407911e3c
  - Title: *The Constitutional Nation: An AI-First Roadmap for Israel's Next Government*
  - V1 draft written 24 Sep 2026. English.
- **Research brief and all source links:** [`00-research-brief-and-workplan.md`](./00-research-brief-and-workplan.md)

## Decisions made by the user (do not re-litigate)

| Decision | Answer |
|---|---|
| Who asked | **Orot Hashachar** (party running in the 27 Oct 2026 election, list led by Nissim Louk) |
| Partisanship | **Non-partisan roadmap for all parties**, offered equally and published openly |
| Build status | **Stated openly**: HRC in v1 drafting and not ratified; firewall designed with its schema written but not wired; gate 4 not built |
| Language and format | **English first**, as a living document; Hebrew edition after sign-off |

## Structure of V1

0 Status note · Executive brief (3 asks, 100-day table, NIS 150–250m envelope) ·
1 The moment · 2 Diagnosis · 3 Principles (10 HRC clauses mapped to duties) ·
4 Architecture (citizen agent, 4-gate firewall, ledger) · 5 Open-source regulation ·
6 Start-up Nation 2.0 / Builders' Corps · 7 Funding · 8 Legal path and election-law guardrails ·
9 Roadmap and pilots · 10 Risks · Appendix (verification checklist and sources)

## Key positions taken in the draft

- Complete the existing National AI Program (PMO Directorate, Erez Askal); do not compete with it.
- Hook the firewall to the May 2026 *Guide for Responsible AI Use in the Public Sector*: the guide's risk level becomes the credential's scope.
- Civilian government only; defence is out of scope (HRC I.8).
- State adopts 10 clauses as a *standard* by resolution now; a framework law comes only after HRC ratification.
- Candidate pilots: Population Authority, National Insurance, small-business registration.
- Recommended licence: AGPL for the firewall and rules, Apache-2.0 dual licence for vendor libraries.
- Election-law guardrails: equal offer, no campaigning, no in-kind donation, AI disclosure, lawyer review.

## Open items for V2

- Everything on the doc's "Still to verify" checklist (Basic Law deadlines, Party Financing Law in-kind rules, Hebrew primary texts, costings).
- Costings reviewed by a budget expert.
- Hebrew translation.
- Possible: slide deck version; site page / agent script for the Builders' Corps call.

## Style rules (from CLAUDE.md)

Warm, civilizational, never corporate or AI-hype. Avoid: disrupt, revolutionize, game-changer,
supercharge, unleash, next-gen.

## PDF export

- Current PDF: [`Constitutional-Nation-V1-Draft.pdf`](./Constitutional-Nation-V1-Draft.pdf) (A4, 19 pages, built from doc rev 15).
- The docs tool's own PDF export prints diagrams as raw code, so use `build-pdf.js` instead:
  export the doc tab as HTML, `npm pack mermaid@11` for the diagram library (the CDN is blocked
  in cloud sessions), then `node build-pdf.js out.pdf`. Diagrams are switched to top-down for print.
- Regenerate the PDF after every round of edits to the living doc; the doc is the source of truth.
