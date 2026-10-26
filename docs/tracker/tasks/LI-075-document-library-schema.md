# LI-075: Document library schema + seed (categories)

- Epic: EPIC-13
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-045

## Description

Extend the handbook-only document model into a library: categories, language, descriptions, access level, legal-sample flag, and demo seed beyond the seller handbook (DOC-001).

## Acceptance criteria

- [x] Document rows support category, locale, description (BG/EN), optional source, legal-sample warning flag.
- [x] Categories cover handbook, powers of attorney, declarations, contracts/templates, other guides.
- [x] Idempotent seed adds at least one public non-handbook demo document.
- [x] Existing handbook counters and versions keep working.

## Out of scope

- Full admin/public library UIs (LI-076+); period analytics UI.

## Result

Migration `0026_regular_dazzler.sql`; `locale`/`source`/`legalSample`/`responsibleEditor`; shared categories; demo power-of-attorney seed; documents seed test green.
