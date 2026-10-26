# LI-034: Admin property gallery UI

- Epic: EPIC-05
- Status: Done
- Priority: P1
- Size: M
- Area: admin
- Depends on: LI-033

## Description

On the property editor, upload images, see thumbnails, set primary, archive, and edit BG/EN alt text.

## Acceptance criteria

- [x] Upload control on the property editor.
- [x] List with primary + archive actions; alt BG/EN fields.
- [x] Loading and error states with i18n.

## Out of scope

- Drag-and-drop reorder polish (simple sort buttons ok); video embeds.

## Implementation notes

## Result

- `PropertyGallery` on the editor (existing properties only); upload via FormData + credentials.
