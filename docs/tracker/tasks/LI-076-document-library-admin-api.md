# LI-076: Document library admin API

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-075

## Description

Admin can list/create/update/archive library documents, upload new versions, set current version, without a developer (DOC-001).

## Acceptance criteria

- [x] Admin endpoints for document CRUD + version upload/publish (beyond handbook-only).
- [x] Access level and category editable; archive keeps download counters.
- [x] Integration tests for create → upload version → set current.

## Out of scope

- Admin React UI polish (basic page OK in LI-077); public pages.

## Result

`GET/POST /documents`, `GET/PATCH /documents/:id`, archive, version upload/publish; handbook shortcuts preserved; integration test green.
