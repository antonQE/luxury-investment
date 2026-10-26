# LI-041: Articles and pages schema + seed

- Epic: EPIC-12
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-006

## Description

Tables for CMS articles and static pages with BG/EN translations, publish status, soft archive and idempotent demo seed.

## Acceptance criteria

- [x] Schema + migration for `articles` and `pages` (slug, status, cover/hero URL, timestamps, archive).
- [x] Shared status constants; labels/body via `translations`.
- [x] Idempotent seed with fictional Demo articles and a few pages (including a sell-with-us slug).

## Out of scope

- Public routes; admin UI; landing builder; revisions/approvals.

## Implementation notes

- Follow team/partners pattern: entity row + `translations` for title/excerpt/body.
- Statuses: `draft` | `published` | `archived` (archive also sets `archivedAt`).

## Result

- Migration `0015`; `CONTENT_STATUSES` / `PAGE_KINDS`; seed module `content`; seed test green.
