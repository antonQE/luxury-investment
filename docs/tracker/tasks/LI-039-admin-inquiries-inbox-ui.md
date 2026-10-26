# LI-039: Admin inquiries inbox UI

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: admin
- Depends on: LI-038

## Description

Basic admin screen to list inquiries and change status (new → in progress → closed).

## Acceptance criteria

- [x] Inbox page with list (type, property, name, email, status, created).
- [x] Status change action; loading and error states with i18n (BG/EN).
- [x] Nav entry in the admin shell.

## Out of scope

- Filters/search polish; assignment to agents; detail drawer beyond what the list needs.

## Implementation notes

## Result

- `InquiriesInbox` page + nav; PATCH status via select; BG/EN strings.
