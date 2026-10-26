# LI-037: Admin team, offices and partners CRUD (basic)

- Epic: EPIC-08
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-035, LI-019

## Description

Authenticated admin API and basic screens to list/create/edit/archive team members, offices and partners (BG/EN labels).

## Acceptance criteria

- [x] Admin API under `/v1/admin` with `content:read` / `content:write`.
- [x] Screens for team list + one of offices or partners; archive without hard delete.
- [x] Nav entries in admin shell.

## Out of scope

- Qualification editor polish; photo upload via media pipeline (URL field enough).

## Implementation notes

- Team + partners screens; offices via API only for R1 basic.

## Result

- Admin API for team/offices/partners; Team and Partners pages with create/list/archive; nav entries; tests and lint green.
