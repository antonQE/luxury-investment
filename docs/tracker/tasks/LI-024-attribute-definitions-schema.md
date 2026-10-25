# LI-024: Attribute definitions schema + seed

- Epic: EPIC-03
- Status: Backlog
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-023

## Description

`attribute_definitions` and `attribute_options` with type, unit, validation, applicability, public/filterable flags, order, help text and translations. Seed a minimal set used by apartments (two areas already columns in EPIC-04) plus a few international extras as stubs.

## Acceptance criteria

- [ ] Schema + migration per ADR-0009.
- [ ] Idempotent seed of a small definition set.
- [ ] Shared zod types for definition keys where useful.

## Out of scope

- Property value storage (EPIC-04); admin UI.

## Implementation notes

## Result
