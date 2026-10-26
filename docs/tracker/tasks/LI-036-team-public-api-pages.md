# LI-036: Public team/offices/partners API and pages

- Epic: EPIC-08
- Status: Done
- Priority: P1
- Size: L
- Area: web
- Depends on: LI-035

## Description

Public read API and site pages: team list + profile, offices on contact, partner logos on home (and about).

## Acceptance criteria

- [x] `GET /v1/public/team`, `/team/:slug`, `/offices`, `/partners`.
- [x] Pages `/ekip`, `/ekip/[slug]`; contact lists offices; home shows partner strip.
- [x] Only public/active non-archived rows; i18n BG/EN.

## Out of scope

- Admin CRUD (LI-037).

## Implementation notes

## Result

- Public routers + web pages; nav `Екип`; sitemap includes `/ekip/`.
