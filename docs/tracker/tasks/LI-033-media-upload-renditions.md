# LI-033: Media upload API + sharp renditions

- Epic: EPIC-05
- Status: Done
- Priority: P1
- Size: L
- Area: api
- Depends on: LI-032

## Description

Authenticated multipart upload for property images with type/size checks; store original; generate web/thumb/social JPEG via sharp in-process; expose admin list/reorder/set-primary/archive.

## Acceptance criteria

- [x] `POST /v1/admin/properties/:id/media` accepts image upload (`properties:write`).
- [x] Original kept; at least thumb + web + social 1200×630 generated.
- [x] List/patch/archive endpoints; private visibility not served on public routes.
- [x] Integration test covers upload + public serializer excludes private.

## Out of scope

- Video/3D links UI polish; watermark; signed GCS uploads.

## Implementation notes

## Result

- Multer upload + sharp derivatives; public `GET /v1/public/media/:assetId/:variant`.
- Public property serializer prefers public media URLs when present.
