# LI-029: Admin property list and editor UI (basic)

- Epic: EPIC-04
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-028

## Description

Basic admin screens: property list and a create/edit form with BG/EN titles, core fields, dual areas, status and publish/archive actions.

## Acceptance criteria

- [x] List page shows reference, title, status, market.
- [x] Editor can create a draft and publish when valid.
- [x] Nav entry under the admin shell.

## Out of scope

- Rich-text polish; media gallery; stepped wizard; duplicate.

## Implementation notes

- Publish assigns the current user as responsible agent.

## Result

- Routes `/properties`, `/properties/new`, `/properties/:id`; nav + i18n BG/EN.
- List + editor call admin properties API; typecheck/lint clean.
