# LI-080: Marketing + portals admin API

- Epic: EPIC-10
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-079

## Description

Admin CRUD for activities and portal listings; append measurements; UTM helper string (MKT-001..003).

## Acceptance criteria

- [x] Admin endpoints scoped by propertyId.
- [x] Append measurement leaves previous rows intact.
- [x] Integration test for activity + portal + measurement.

## Out of scope

- Evidence file uploads beyond URL/notes fields; public UI.

## Result

Admin marketing routes under `/v1/admin/marketing/*`; append measurement returns previous/current counts; integration test green.
