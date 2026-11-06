# LI-091: Landing admin builder (basic)

- Epic: EPIC-12
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-090

## Description

Staff create/edit landings, reorder sections, set slug/SEO/robots and publish without a developer (CONTENT-003 basic).

## Acceptance criteria

- [x] List/create/edit/archive landings.
- [x] Add/remove/reorder allowed section types; save payload.
- [x] Empty/error/loading states.

## Out of scope

- AI copy helper; full visual WYSIWYG; approval workflow (later task).

## Implementation notes

- Admin API `/v1/admin/landings`; LandingAdminService; admin UI `/landings` with JSON section payloads.
- Section payloads validated via shared zod schemas.

## Result

Admin CRUD + publish/archive; integration test green.
