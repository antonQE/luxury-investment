# LI-024: Attribute definitions schema + seed

- Epic: EPIC-03
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-023

## Description

`attribute_definitions` and `attribute_options` with type, unit, validation, applicability, public/filterable flags, order, help text and translations. Seed a minimal set used by apartments (two areas already columns in EPIC-04) plus a few international extras as stubs.

## Acceptance criteria

- [x] Schema + migration per ADR-0009.
- [x] Idempotent seed of a small definition set.
- [x] Shared zod types for definition keys where useful.

## Out of scope

- Property value storage (EPIC-04); admin UI.

## Implementation notes

- `attribute_definitions` + `attribute_options`; labels/help via `translations`.
- Seed heating, parking, furnished, Dubai community (stub), floor — not the two apartment areas (those stay columns in EPIC-04).

## Result

- Migration `0008`; seed module `attributes` (5 definitions; heating/parking options).
- Shared `ATTRIBUTE_DATA_TYPES` / `SEEDED_ATTRIBUTE_KEYS` in `@luxury-investment/shared`.
- Integration test confirms idempotent seed + select options.
