# LI-032: Media assets schema + local storage port

- Epic: EPIC-05
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-031

## Description

`media_assets` (and rendition metadata) for property attachments; local filesystem storage adapter behind a port; seed optional demo asset paths stay URL-based until upload lands.

## Acceptance criteria

- [x] Schema + migration for assets linked to properties (kind, visibility, sort, alt/caption BG/EN, primary flag).
- [x] `StoragePort` + local adapter with env `MEDIA_LOCAL_ROOT`.
- [x] Unit test for local put/get/delete.

## Out of scope

- HTTP upload; sharp; admin UI.

## Implementation notes

## Result

- Migration `0012`; `LocalStorage` + unit tests; env `MEDIA_LOCAL_ROOT` / `MEDIA_PUBLIC_BASE_URL`.
