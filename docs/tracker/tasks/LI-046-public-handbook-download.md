# LI-046: Public handbook download API + page

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-045

## Description

Public endpoint that streams/redirects the current handbook version, records a download event, and a site surface (Sell with us or dedicated) with a download CTA.

## Acceptance criteria

- [x] `GET /v1/public/documents/seller-handbook` (or by slug) returns the current published file and logs a successful download event.
- [x] CTA on Sell with us (and/or footer) opens the download.
- [x] Failed/missing version returns 404 without counting success.

## Out of scope

- Admin upload UI (LI-047); period analytics dashboard.

## Implementation notes

## Result

- Document public service + router; seed writes demo PDF to local storage; CTA on `/prodai-s-nas`; integration tests green.
