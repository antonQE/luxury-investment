# LI-042: Public articles and pages API + site routes

- Epic: EPIC-12
- Status: Done
- Priority: P1
- Size: L
- Area: web
- Depends on: LI-041

## Description

Public read API and Next.js pages for the articles list/detail and CMS-driven static pages.

## Acceptance criteria

- [x] `GET /v1/public/articles`, `/articles/:slug`, `/pages/:slug` (published only).
- [x] Site routes for articles list + article detail; at least one CMS page rendered from API.
- [x] Nav/sitemap entries; i18n BG/EN.

## Out of scope

- Admin CRUD (LI-044); Sell with us (LI-043).

## Implementation notes

## Result

- Public content service/router; `/stati`, `/stati/[slug]`, `/stranici/[slug]`; nav + footer privacy; tests green.
