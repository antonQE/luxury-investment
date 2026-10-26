# LI-063: Contact duplicate detection hints

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: S
- Area: api
- Depends on: LI-062

## Description

When creating/updating a contact or ingesting an inquiry, suggest possible duplicates by email/phone without auto-merging.

## Acceptance criteria

- [x] API endpoint or create response payload with candidate matches.
- [x] Admin UI shows warning with candidates.
- [x] No silent overwrite of existing contacts.

## Out of scope

- Automated merge; fuzzy name matching beyond email/phone.

## Result

`GET /contacts/duplicates` + `duplicateHints` on create/patch; admin warning + check button. Tests green.
