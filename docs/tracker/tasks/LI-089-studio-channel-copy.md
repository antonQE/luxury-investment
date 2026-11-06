# LI-089: Studio channel copy snippets (BG/EN)

- Epic: EPIC-15
- Status: Done
- Priority: P2
- Size: M
- Area: admin
- Depends on: LI-087

## Description

Generate editable short/long channel texts (FB/IG/email etc.) from listing fields in BG/EN; staff copy after manual review — no auto-publish, no AI (MEDIA-006).

## Acceptance criteria

- [x] Snippets built from catalog fields only (template strings).
- [x] UI shows BG/EN variants with copy-to-clipboard.
- [x] Explicit note that texts require human confirmation.

## Out of scope

- LLM/AI rewriting; scheduling posts.

## Implementation notes

- Shared `buildChannelCopySnippets` for facebook/instagram/tiktok/linkedin/email × bg/en × short/long.
- `GET /v1/admin/studio/channel-copy?propertyId=`; Studio UI section with clipboard copy.

## Result

Channel copy API + Marketing studio UI; unit + integration tests green.
