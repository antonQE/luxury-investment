# LI-106: Admin team full profile edit (incl. photos)

- Epic: EPIC-08
- Status: Done
- Priority: P1
- Size: M
- Area: api, admin
- Depends on: LI-037

## Description

Owner feedback: from the Team menu, staff must be able to edit all profile fields for people, including photos.

## Acceptance criteria

- [x] Admin can open an existing team member and edit: kind, names, roles, bios, email, phone, markets, languages, qualifications, sort order, visibility, photo.
- [x] Photo can be uploaded (file) and/or set via URL; served publicly at `/v1/public/team-media/:id/:file`.
- [x] Create form covers the same fields; photo file upload after first save.
- [x] Soft archive remains available.

## Out of scope

- Linking team member to User account; offices/partners full edit polish.

## Result

`GET`/`PATCH /v1/admin/team/:id`, `POST .../photo`, expanded Team admin form with edit from the list; integration test covers update + upload.
