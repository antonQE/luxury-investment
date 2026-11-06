# LI-087: Marketing studio admin UI (basic)

- Epic: EPIC-15
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-086

## Description

From a property, staff open a basic marketing studio: toggle brochure elements, preview/download PDF (MEDIA-005 / MEDIA-006 basic).

## Acceptance criteria

- [x] Property-scoped studio page or panel with element toggles.
- [x] Trigger generate + download; loading/error/empty states.
- [x] Permission-gated via existing property permissions.

## Out of scope

- Drag-and-drop template designer; channel copy editor; social exports (LI-088).

## Implementation notes

- Admin page `/studio`: property select, toggle checkboxes, generate PDF, download via export id.
- Reuse marketing page patterns; i18n BG/EN; empty/error/loading.

## Result

Admin nav **Studio** (`/studio`): property + A4 template + toggles → generate/download; exports history table.
