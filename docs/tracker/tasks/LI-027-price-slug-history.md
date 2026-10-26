# LI-027: Price history and slug history

- Epic: EPIC-04
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-026

## Description

Tables and service hooks for price changes and slug history so old public URLs can 301 and owner reports can show price dynamics.

## Acceptance criteria

- [x] `property_price_history` and `property_slug_history` schema + migration.
- [x] Recording a price or slug change appends history (unit/integration test).
- [x] Lookup helper for previous slug → current slug (used by public redirects later).

## Out of scope

- Full admin UI for history; public 301 wiring can land with LI-028/029 if small.

## Implementation notes

- `PropertyHistoryService.recordPriceChange` / `recordSlugChange` / `resolveSlug`.

## Result

- Migration `0011`; service + integration test for price append and slug resolve.
