# LI-035: Team, offices and partners schema + seed

- Epic: EPIC-08
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-022

## Description

Tables for public team members, offices and partners with translations, sort order, visibility and soft archive; idempotent demo seed.

## Acceptance criteria

- [x] Schema + migration for `team_members`, `offices`, `partners`.
- [x] Idempotent seed with fictional demo rows (example.com / +359 000).
- [x] Shared kinds/constants where useful.

## Out of scope

- Admin UI; public pages; media upload for photos (URL fields ok for R1).

## Implementation notes

## Result

- Migration `0013`; seed module `team`; shared `TEAM_MEMBER_KINDS`.
