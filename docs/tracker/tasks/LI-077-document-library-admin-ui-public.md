# LI-077: Document library admin UI + public list

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-076

## Description

Admin UI for the document library; public page listing public documents by category with download and legal-sample disclaimer (DOC-001).

## Acceptance criteria

- [x] Admin page lists documents, uploads versions, archives.
- [x] Public library page groups by category; handbook remains available.
- [x] Legal samples show sample/disclaimer text.
- [x] Download still increments counters (total + per version).

## Out of scope

- Period/source analytics charts (LI-078).

## Result

Admin `/documents` library page; public `/dokumenti` with category groups + legal disclaimer; `GET /v1/public/documents`; handbook shortcut kept.
