# LI-107: Property editor uses Locations + Property Types selects

- Epic: EPIC-04
- Status: Done
- Priority: P1
- Size: M
- Area: admin, shared
- Depends on: LI-037, property editor

## Description

Owner feedback: Property Types and Locations from the admin sidebar must appear as select menus when creating/editing a property. If a location is missing, allow adding a new one from the property form.

## Acceptance criteria

- [x] Property type select is populated from the Property Types catalog (taxonomy).
- [x] Location select is populated from Locations; choosing one sets `locationId` and denormalized city/district/country.
- [x] From the property form, staff can create a new location when it is missing.
- [x] Market select uses the Markets taxonomy labels.
- [x] Shared `PROPERTY_TYPES` includes seeded extras (`business`, `villa`, `garage`, `shop`).

## Out of scope

- Full parent-tree location browser UI beyond city/district create.

## Result

Property editor loads catalog taxonomies + locations; inline “Add location” creates via existing admin locations API and selects the new row.
