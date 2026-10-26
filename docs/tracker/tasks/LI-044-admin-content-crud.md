# LI-044: Admin articles/pages CRUD (basic)

- Epic: EPIC-12
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-041, LI-019

## Description

Authenticated admin API and basic screens to list/create/edit/publish/archive articles and pages.

## Acceptance criteria

- [x] Admin API under `/v1/admin` with `content:read` / `content:write`.
- [x] Screens for articles list + create/edit (BG/EN fields); publish and archive.
- [x] Nav entries in the admin shell.

## Out of scope

- Revisions, approval roles, landing builder, media upload for covers (URL field enough).

## Implementation notes

- Pages admin API included; dedicated pages UI deferred (seed + public routes cover R1).

## Result

- Content admin service/router; Articles admin page; integration test green.
