# LI-055: Catalog list filters (city, range, ID)

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: M
- Area: api, web
- Depends on: LI-010, LI-054

## Description

R1 listings need the current-site filter set beyond transaction/type/market: city, neighbourhood (district), bedrooms, price and area ranges, and ID / free-text search, with shareable URL state.

## Acceptance criteria

- [x] Public `GET /v1/public/properties` accepts optional `city`, `district`, `bedroomsMin`, `priceMin`, `priceMax`, `areaMin`, `areaMax`, `q` (reference number or title text).
- [x] `/obiavi` search form exposes those fields; URL query mirrors them.
- [x] Integration coverage for at least ID/`q` and one range filter; typecheck/lint pass.

## Out of scope

- Admin-configured filter levels; type-specific attribute filters; map search; sort options beyond newest-first.

## Implementation notes

- Extend `propertyListQuerySchema` and `PropertyRepo.filters`; keep invalid enum markets rejected as today.
- Free-text `q`: case-insensitive match on `referenceNumber` or title (bg/en).

## Result

Extended shared query schema + `PropertyRepo` filters; `SearchForm` fields with shareable URL params; API integration test for `q`/city/bedrooms/price. Smoke: `q=DEMO-1007` → 1, `priceMax=50000` → 3.
