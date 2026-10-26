# LI-053: Admin offices CRUD UI

- Epic: EPIC-08
- Status: Done
- Priority: P1
- Size: S
- Area: admin
- Depends on: LI-037

## Description

Basic admin screen to list/create/archive offices (API already exists from LI-037). Completes the R1 offices gap deferred in EPIC-08.

## Acceptance criteria

- [x] Offices list + create form (slug, BG/EN name and address, map query, optional phone/email).
- [x] Archive action; loading/error states with i18n.
- [x] Nav entry in the admin shell.

## Out of scope

- Opening hours editor polish; map embed preview.

## Implementation notes

- Reuse PartnersList patterns; call existing `/v1/admin/offices` endpoints.

## Result

- `OfficesList` page + nav; API create/archive covered by team-admin test; HTTP smoke green.
