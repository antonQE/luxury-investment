# LI-030: Duplicate property

- Epic: EPIC-04
- Status: Done
- Priority: P2
- Size: S
- Area: api
- Depends on: LI-028

## Description

Admin action to duplicate a property into a new draft with a new reference number and slug.

## Acceptance criteria

- [x] `POST /v1/admin/properties/:id/duplicate` creates a draft copy.
- [x] Copy clears publish state and gets unique slug/reference.

## Out of scope

- Media file duplication (EPIC-05); UI can call the endpoint from LI-029 as a follow-up.

## Implementation notes

## Result

- `PropertyAdminService.duplicate` + admin route; integration test.
