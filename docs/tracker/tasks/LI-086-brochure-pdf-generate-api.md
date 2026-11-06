# LI-086: Property brochure PDF generate API

- Epic: EPIC-15
- Status: Done
- Priority: P1
- Size: L
- Area: api
- Depends on: LI-085

## Description

Staff with permission generate a branded PDF brochure for a property from catalog data, with toggleable elements and a downloadable file (MEDIA-005 basic).

## Acceptance criteria

- [x] Admin POST generates PDF for a property + toggle payload.
- [x] Output stored (or streamed) with audit-friendly metadata; QR points at current public URL.
- [x] Integration test with a fixture property (no invented attributes).

## Out of scope

- Full visual template editor; social image sizes; Meta publish.

## Implementation notes

- Playwright Chromium HTML→PDF (ADR-0013); `playwright` dep on api; Chrome channel fallback locally.
- Table `brochure_exports` for audit metadata + storage key.
- Admin POST `/v1/admin/studio/brochures/generate` with propertyId, templateKey?, toggles.
- QR / link use `PUBLIC_SITE_URL` + `/obiavi/{slug}/`.
- Integration test installs/uses Chromium; catalog fields only.

## Result

Migration `0030_damp_the_order.sql`; generate + download endpoints; Playwright renderer; QR via `qrcode`; HTML unit + integration tests green.
