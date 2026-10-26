# LI-038: Inquiry status fields + admin list API

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-017, LI-019

## Description

Extend the inquiries table with a simple status and expose authenticated admin list/get/update endpoints so staff can work the inbox.

## Acceptance criteria

- [x] Schema + migration: `status` (`new` | `in_progress` | `closed`) with default `new`; shared constants/schema.
- [x] Admin API `GET/PATCH /v1/admin/inquiries` (list + update status) gated by `inquiries:read` / `inquiries:write`.
- [x] Idempotent seed with a few fictional demo inquiries; API tests green.

## Out of scope

- Admin UI (LI-039); email sending (LI-040); contacts/assignment/viewings.

## Implementation notes

- Reuse existing `inquiries` table from LI-017; soft fields only — no hard delete.
- Mirror permission checks used in property/team admin handlers.

## Result

- Migration `0014`; `INQUIRY_STATUSES` in shared; admin list/get/patch; seed module; integration test green.
