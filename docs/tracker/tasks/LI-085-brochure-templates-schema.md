# LI-085: Brochure templates schema + seed

- Epic: EPIC-15
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-084

## Description

Store brochure/social template definitions and per-job element toggles so a property can be exported without inventing listing data (MEDIA-005).

## Acceptance criteria

- [x] Tables for template definitions (kind, format, locale) and optional default toggle sets.
- [x] Seed at least one A4 brochure template and one social size template.
- [x] Idempotent seed test.

## Out of scope

- PDF bytes generation; admin UI.

## Implementation notes

- Shared enums + default toggle zod schema in `packages/shared`.
- Tables `brochure_templates` (+ unique key) with format/kind/locale and default toggles JSON.
- Seed A4 brochure + Instagram feed social template; idempotent by `key`.
- Migration via `db:generate`.

## Result

Migration `0029_tired_genesis.sql`; `brochure_templates` + studio seed (`demo-brochure-a4`, `demo-social-feed`); shared toggles schema; seed test green.
