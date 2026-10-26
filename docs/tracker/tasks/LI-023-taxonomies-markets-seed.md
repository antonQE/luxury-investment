# LI-023: Markets and core taxonomies schema + seed

- Epic: EPIC-03
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-022

## Description

Schema and seeds for markets (Sofia, Black Sea, Dubai & abroad), property types, transaction types, badges and BG construction stages (building permit, Act 14–16).

## Acceptance criteria

- [x] Tables + migration; translations for labels.
- [x] Idempotent seeds matching ROLE/spec lists and inventory (deduped badges).
- [x] Markets remain independent of geography (optional links later).

## Out of scope

- Attribute definitions (LI-024); admin screens.

## Implementation notes

- Tables: `markets`, `property_types`, `transaction_types`, `badges`, `construction_stages`, `listing_statuses` — labels via shared `translations`.
- Seed keys align with `@luxury-investment/shared` where possible; badges deduped from inventory.

## Result

- Migration `0007` for markets + five taxonomy tables; labels in `translations`.
- Seed: 3 markets, sale/rent, 9 property types, 6 deduped badges, Act stages, listing statuses.
- Idempotent seed test green.
