# LI-054: Empty search results inquiry form

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: S
- Area: web
- Depends on: LI-017

## Description

When the property listings page has no matches, visitors can submit their search criteria as an inquiry (R1 empty-state requirement).

## Acceptance criteria

- [x] Empty state on `/obiavi` shows a short inquiry form (name, email, phone, message) with consent + honeypot.
- [x] Submits as `inquiry` with a synthetic propertySlug (e.g. `search-request`) and message including current filter summary when present.
- [x] Success/error UI; i18n BG/EN.

## Out of scope

- Dedicated search-request CRM type; advanced saved-search UX.

## Implementation notes

- Reuse `postInquiry` helper; keep form small next to existing empty copy.

## Result

`SearchRequestForm` on empty `/obiavi` state; `propertySlug: search-request`; filter query string appended to message; BG/EN `SearchRequest` strings. Verified empty combo `market=black_sea&propertyType=office` and public inquiry create.
