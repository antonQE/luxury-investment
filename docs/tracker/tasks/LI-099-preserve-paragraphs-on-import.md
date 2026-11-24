# LI-099: Preserve paragraphs when stripping HTML on import

- Epic: EPIC-17
- Status: Done
- Priority: P1
- Size: S
- Area: api
- Depends on: LI-051

## Description

Owner feedback: property and article bodies on the public site appear as one continuous wall of text with no paragraphs. Root cause: WXR `stripHtml` replaced every tag with a space and collapsed all whitespace, wiping paragraph breaks from WordPress HTML.

## Acceptance criteria

- [x] `stripHtml` keeps paragraph / line breaks from block tags and `<br>`.
- [x] Unit coverage for multi-paragraph HTML → plain text.
- [x] Local DB re-imported from the existing WXR dump so published bodies regain paragraphs.
- [x] Public pages already use `whitespace-pre-line` (no front-end change required for the basic fix).

## Out of scope

- Rich-text editor (Tiptap) in admin; storing sanitized HTML for public render.

## Result

Import preserves `\n\n` between paragraphs; re-import updates existing property/article bodies.
