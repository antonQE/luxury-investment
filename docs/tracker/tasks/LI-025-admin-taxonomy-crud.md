# LI-025: Admin taxonomy and location CRUD (basic)

- Epic: EPIC-03
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-024, LI-019

## Description

Basic authenticated admin screens and API to list/create/edit/archive locations, markets and core taxonomies (no merge UI yet).

## Acceptance criteria

- [x] Admin API under `/v1/admin` with permission checks.
- [x] Screens for at least locations + one taxonomy list; BG/EN label fields.
- [x] Archive action; no hard delete of referenced rows.

## Out of scope

- Merge tool; attribute definition editor polish (can be LI-026 if needed).

## Implementation notes

- Permissions: `catalog:read` / `catalog:write`.
- API: `/v1/admin/locations` and `/v1/admin/taxonomies/:kind` (CRUD + archive).
- Admin screens: Locations + Property types; BG/EN name fields.

## Result

- Admin API: locations + taxonomies CRUD/archive with `catalog:read`/`catalog:write`.
- Admin UI: Locations and Property types pages (nav, create form, list, archive).
- Integration tests cover list/create/archive; no hard delete.
