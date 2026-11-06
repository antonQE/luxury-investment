# LI-090: Landing pages schema + section types

- Epic: EPIC-12
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Campaign landing pages composed of managed section types (hero, benefits, CTA/form, related listings, FAQ, …) with own URL and SEO fields (CONTENT-003).

## Acceptance criteria

- [x] Tables for landings + ordered sections (typed payload JSON validated by zod).
- [x] Seed one demo landing (e.g. sellers campaign) not in main nav.
- [x] AI assistant explicitly out of scope for this epic rest.

## Out of scope

- Admin builder UI; public route; AI writing tools.

## Implementation notes

- Shared `landings.ts` section payloads; `landing_pages` / `landing_sections` tables (migration 0031).
- Demo `demo-sellers` / slug `za-prodavachi`, `showInNav: false`, hero + benefits + cta_form.

## Result

Schema + zod + seed green; public/admin APIs deferred to LI-091/092.
