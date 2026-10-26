# LI-051: WordPress/data import scripts

- Epic: EPIC-17
- Status: Done
- Priority: P1
- Size: L
- Area: api
- Depends on: LI-050

## Description

Repeatable scripts that import properties, media URLs, taxonomies, agents, articles and pages from the current site WXR export into the new schema, with dry-run and idempotent re-runs.

## Acceptance criteria

- [x] Import CLI with `--dry-run`; maps fields per the runbook.
- [x] Taxonomy mapping with flagged ambiguous / unmapped values.
- [x] Test import against a fixture (and dry-run against the real WXR) succeeds for a representative sample.
- [x] Source dump stays outside git (`.data/wxr/`).

## Out of scope

- Live cutover; inventing historical analytics; downloading every attachment into local media storage (follow-up: keep remote URLs first).
- Full TranslatePress EN bodies (export is BG-primary; EN copied with `needs-review` flag in notes).
- Static CMS pages from WXR (theme stubs filtered later).

## Implementation notes

- Source: WXR Tools → Export (`estate_property`, `estate_agent`, attachments, posts/pages).
- Path default: `.data/wxr/*.xml` (gitignored).
- Reference numbers: `WP-{post_id}`; media via `image_to_attach` → attachment URLs.
- CLI: `npm run db:import-wxr -- --file … [--dry-run] [--limit N]`.

## Result

WXR parser/mapper/importer under `apps/api/src/modules/migration/`; unit fixture test green. Real dry-run: 136 published + 4 draft properties, 9 agents, 10 articles, 2652 attachments. Applied import to local DB (140 properties upserted); idempotent re-run updates. Dump lives in `.data/wxr/` (gitignored).
