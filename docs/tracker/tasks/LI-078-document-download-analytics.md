# LI-078: Document download analytics by period/source

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: S
- Area: api
- Depends on: LI-045

## Description

Admin can see download totals filtered by period and traffic source, without resetting on new versions (DOC-001).

## Acceptance criteria

- [x] Admin endpoint: totals for a document by date range and optional source.
- [x] Page-view vs download attempt/success remain distinguishable via existing events.
- [x] Test: two versions’ downloads sum correctly across a date range.

## Out of scope

- Fancy charts; CRM client documents.

## Result

`GET /v1/admin/documents/:id/download-stats` with success/attempt totals, byVersion and bySource; integration test green.
