# LI-010: First public catalog and site

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: L
- Area: web
- Depends on: LI-006, LI-007

## Description

A visitor can open a working public site: header and footer, home with the three markets and newest listings, a filterable list at `/obiavi/`, and a property page at `/obiavi/<slug>/`. Data comes from the denormalized snapshot (ADR-0005) and fictional seeds.

## Acceptance criteria

- [x] Public API: `GET /v1/public/properties` (filters: transaction, type, market; newest first) and `GET /v1/public/properties/:slug`.
- [x] Drizzle migration for `properties` and an idempotent seed of recognisably fictional listings.
- [x] Site chrome: header (nav, language switch, phone), footer, BG/EN messages.
- [x] Home shows the three markets, a quick search and newest property cards.
- [x] `/obiavi/` lists cards from the API, keeps filters in the URL, and has empty and error states.
- [x] `/obiavi/<slug>/` shows gallery, facts, description and agent contact; unknown slug is 404.
- [x] About and contact pages exist so the main menu works.
- [x] Loading, empty and error states handled; all user-visible text through i18n; interactive elements have `data-testid`.

## Out of scope

- Configurable taxonomies and the admin editor (EPIC-03/04).
- Inquiry forms stored in the API, maps, similar properties, print, share, cookie banner.
- Admin app (LI-008).

## Implementation notes

- Snapshot table and public serializers as in ADR-0005.
- URLs match the current site: `/`, `/obiavi/`, `/obiavi/<slug>/`, `/za-nas/`, `/contact/`.
- Temporary design tokens in `globals.css` (cream / ink / gold) until the EPIC-06 design task.

## Result

First visible public site on the denormalized snapshot (ADR-0005).

- API: `properties` table, migration `0001_exotic_supernaut`, 8 fictional seed listings, public list/detail endpoints, 2 integration tests.
- Web: header/footer, BG/EN, home (markets + search + newest), `/obiavi/` with URL filters, `/obiavi/<slug>/`, `/za-nas/`, `/uslugi/`, `/contact/`.
- Verified in the browser: `/` and `/en/` render listings; `/obiavi/?market=sofia` shows 4 cards; `/en/obiavi/?transactionType=rent` shows 2 rentals; property page and 404 work; typecheck, lint and unit/integration tests pass.

Follow-up (already on the board): LI-008 admin skeleton; later EPIC-03/04 replace the snapshot; inquiry forms, maps and the approved design system are later tasks.
