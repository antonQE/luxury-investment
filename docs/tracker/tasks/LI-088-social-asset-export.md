# LI-088: Social asset image export

- Epic: EPIC-15
- Status: Done
- Priority: P1
- Size: L
- Area: api
- Depends on: LI-086

## Description

Export fixed-size social images for a property: feed 1080×1350, square 1080×1080, story 1080×1920, landscape 1200×630, with badge presets (MEDIA-006).

## Acceptance criteria

- [x] Admin API accepts format + toggles/badge; returns image file.
- [x] Seed/demo covers at least two formats.
- [x] Integration or unit test for render path.

## Out of scope

- Direct publishing to Meta/portals; admin drag editor.

## Implementation notes

- Extend Html/Playwright renderer with PNG screenshot at fixed viewport.
- Shared `generateSocialAssetSchema` + badge presets; seed square format too.
- Admin POST `/v1/admin/studio/social/generate`; wire Studio UI format select.

## Result

PNG export via Playwright; feed + square seeds; Studio UI social section; unit + integration tests green.
