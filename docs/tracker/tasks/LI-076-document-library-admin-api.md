# LI-076: Document library admin API

- Epic: EPIC-13
- Status: Ready
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-075

## Description

Admin can list/create/update/archive library documents, upload new versions, set current version, without a developer (DOC-001).

## Acceptance criteria

- [ ] Admin endpoints for document CRUD + version upload/publish (beyond handbook-only).
- [ ] Access level and category editable; archive keeps download counters.
- [ ] Integration tests for create → upload version → set current.

## Out of scope

- Admin React UI polish (basic page OK in LI-077); public pages.
