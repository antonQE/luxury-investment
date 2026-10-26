# LI-059: Contacts schema + seed

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Introduce CRM contacts (person/company) with multi-role support as the foundation for owners, buyers and inquiry linking in R2.

## Acceptance criteria

- [x] `contacts` and `contact_roles` tables (Drizzle + migration).
- [x] Shared constants/schemas for contact kind and roles.
- [x] Idempotent seed with a few demo contacts (person + company, multiple roles).
- [x] Unit/integration smoke that seed loads and roles attach.
- [x] Tracker/BOARD updated.

## Out of scope

- Admin API/UI, property owner links, duplicate merge UI, inquiry linking (follow-up tasks).

## Implementation notes

- Soft archive via `archived_at`; notes + preferred locale/channel; roles as a join table so combinations are allowed (CRM-001).

## Result

Migration `0017_open_zodiak.sql`; shared `crm.ts`; seed module with 3 demo contacts; tests green.
