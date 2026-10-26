# EPIC-17: Migration and launch

- Status: Done
- Priority: P1
- Source: 09 MIG-001, MIG-002, OPS-001; 11 I-03..I-05; FLOW-014

## Goal

All content of luxuryinvestment.bg (properties, images, IDs, taxonomies, attributes, SEO data, articles, documents, translations) is migrated with old URLs preserved or redirected with a single 301, verified in a test migration, and launched with a rollback plan and post-launch monitoring.

## Scope

- In: inventory; export and field mapping; taxonomy mapping with dedup; ambiguous values kept and flagged for manual review; repeatable migration scripts; test migration and checks on representative properties; redirect map and verification; final export before launch; rollback plan; monitoring of 404s, indexing, broken images, forms and analytics.
- Out: inventing historical statistics (the new counters start from a stated date).

## Tasks

- LI-050: Migration runbook and launch checklist — Done ([runbook](../../migration/runbook.md))
- LI-051: WordPress/data import scripts — Done (WXR 2026-10-26)
- LI-052: Expand redirect map from current-site inventory — Done

## Notes

Public inventory: [02-current-site.analysis.md](../../requirements/02-current-site.analysis.md). Migration source is a **WXR XML export** at `.data/wxr/` (gitignored). Attachment binaries stay on live CDN URLs for R1; optional local media ingest is a follow-up. Production cutover still uses the runbook checklist.
