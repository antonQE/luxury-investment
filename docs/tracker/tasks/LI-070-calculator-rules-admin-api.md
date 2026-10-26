# LI-070: Calculator rules admin API + audit

- Epic: EPIC-14
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-069

## Description

Admin CRUD for calculator rules and enable/disable toggles; every rate change is audited (CALC-ADMIN).

## Acceptance criteria

- [x] Permission-gated list/create/update/archive for rule sets and lines.
- [x] Enable/disable calculator kinds per country.
- [x] Audit entries on create/update of rates.
- [x] Integration tests for happy path + permission deny.

## Out of scope

- Full admin UI polish (basic list/edit page can be thin); mortgage UI.

## Result

`calculators:read/write`; admin API for toggles, rule sets and lines with audit; tests green.
