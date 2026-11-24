# LI-105: Move Seller Handbook under Documents in admin nav

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: S
- Area: admin
- Depends on: —

## Description

Owner feedback: in the admin panel, the Seller Handbook section should live under Documents (not as a separate top-level item).

## Acceptance criteria

- [x] Admin sidebar has a single Documents item (no handbook sub-item).
- [x] Handbook route is `/documents/handbook`; `/handbook` redirects there.
- [x] Both document screens share in-page tabs (Library / Seller handbook).

## Out of scope

- Merging handbook CRUD into the library table UI; public handbook pages.

## Result

Handbook is reached only via Documents in-page tabs (`/documents/handbook`); sidebar shows Documents alone.
