# LI-026: Property schema evolution (catalog model)

- Epic: EPIC-04
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-025

## Description

Evolve the ADR-0005 denormalized `properties` snapshot toward the hybrid catalog model: listing status, dual apartment areas, location link, dynamic attribute values, responsible agent, and draft-safe `published_at`.

## Acceptance criteria

- [x] Schema + migration add status, dual areas, `attribute_values`, `location_id`, agent user id; `published_at` nullable for drafts.
- [x] Public list/detail only return `published` listings; seed still works.
- [x] Serializer exposes primary area from the selectable dual-area fields.

## Out of scope

- Admin CRUD API/UI; price/slug history tables; media.

## Implementation notes

- Keep denormalized country/city/district labels for public until location join lands in a later task.
- `area` remains as the resolved primary numeric for backward-compatible public cards.

## Result

- Migrations `0009` + `0010` (backfill published rows); `properties` module schema.
- Public repo filters `listing_status = published`; draft seed row hidden.
- Dual areas + `primary_area`; serializer resolves public `area` / label.
