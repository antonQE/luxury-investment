# LI-022: Locations schema and seed

- Epic: EPIC-03
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-021

## Description

Postgres tables for the location hierarchy (country → region → city → district → complex) with translations and an idempotent seed from the current-site inventory (deduplicated).

## Acceptance criteria

- [ ] Drizzle schema + migration for `locations` (and translation usage per ADR-0009).
- [ ] Seed Bulgaria + UAE + Greece + North Cyprus with key cities/districts from the inventory (deduped; fictional extras clearly marked if needed).
- [ ] Soft archive column; no hard delete required yet.
- [ ] Unit/integration check that seed is idempotent.

## Out of scope

- Admin CRUD UI; linking properties to locations (EPIC-04).

## Implementation notes

- Tables: `locations`, `translations` (shared for later taxonomies).
- Seed BG / UAE / Greece / North Cyprus + Sofia districts sample; upsert by slug+kind.

## Result

- Migration `0006`: `locations` + `translations`; seed with BG/UAE/GR/North Cyprus and Sofia/Dubai districts (deduped `ovcha-kupel`, `downtown`).
- Idempotent seed test green.
