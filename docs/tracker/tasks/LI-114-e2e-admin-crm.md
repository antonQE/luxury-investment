# LI-114: E2E admin CRM happy paths

- Epic: EPIC-19
- Status: Done
- Priority: P1
- Size: M
- Area: e2e, admin
- Depends on: LI-113

## Description

Playwright smoke for contacts, viewings, and deals (with agent).

## Acceptance criteria

- [x] Contacts list + create smoke.
- [x] Viewings calendar create smoke.
- [x] Deals create with agent + stage change.

## Out of scope

- Full CRM matrix; finance-only commission edge cases beyond smoke.

## Result

Added `apps/e2e/src/admin/crm.spec.ts` (contacts create, viewings create, deals create + stage). Extended `admin-shell.elements.ts` with CRM/ops test ids. All three specs green with seed + auth setup.
