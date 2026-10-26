# LI-079: Marketing plan + portal measurements schema

- Epic: EPIC-10
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Store per-property marketing activities and unlimited portal listings with append-only dated measurements (MKT-001 / MKT-002).

## Acceptance criteria

- [x] Tables: marketing_activities, portal_listings, portal_measurements.
- [x] Measurements never overwrite prior rows (append-only).
- [x] Idempotent demo seed for one property with an activity and a portal measurement.

## Out of scope

- Auto portal APIs; admin UI.

## Result

Migration `0027_wet_donald_blake.sql`; seed + UTM helper; seed test green.
