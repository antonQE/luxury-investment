# LI-078: Document download analytics by period/source

- Epic: EPIC-13
- Status: Backlog
- Priority: P1
- Size: S
- Area: api
- Depends on: LI-045

## Description

Admin can see download totals filtered by period and traffic source, without resetting on new versions (DOC-001).

## Acceptance criteria

- [ ] Admin endpoint: totals for a document by date range and optional source.
- [ ] Page-view vs download attempt/success remain distinguishable via existing events.
- [ ] Test: two versions’ downloads sum correctly across a date range.

## Out of scope

- Fancy charts; CRM client documents.
