# LI-047: Admin handbook upload/version UI (basic)

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: M
- Area: admin
- Depends on: LI-045, LI-033

## Description

Admin can upload a new handbook PDF as a new version, publish it as current, and see basic download counts.

## Acceptance criteria

- [x] Admin API to upload version + publish current; `content:write`.
- [x] Screen showing current version, upload control, total/per-version counts.
- [x] Nav entry.

## Out of scope

- Full document library; revoke old signed URLs polish.

## Implementation notes

## Result

- Document admin service/router; Handbook admin page; upload+publish test green.
