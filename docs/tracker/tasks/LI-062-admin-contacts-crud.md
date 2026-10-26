# LI-062: Admin contacts CRUD API + UI

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-059

## Description

Basic admin list/create/edit/archive for contacts and their roles.

## Acceptance criteria

- [x] Admin API with `contacts:read` / `contacts:write` (or agreed permission keys).
- [x] Admin page: list, create, edit roles, archive.
- [x] i18n + data-testid; tests for API happy path.

## Out of scope

- Duplicate merge wizard; communication history timeline.

## Result

`contacts:read/write` permissions; admin API list/create/patch/archive; Contacts admin page with roles; EN/BG i18n. API test green.
