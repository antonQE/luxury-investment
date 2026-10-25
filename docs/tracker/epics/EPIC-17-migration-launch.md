# EPIC-17: Migration and launch

- Status: Backlog
- Priority: P1
- Source: 09 MIG-001, MIG-002, OPS-001; 11 I-03..I-05; FLOW-014

## Goal

All content of luxuryinvestment.bg (properties, images, IDs, taxonomies, attributes, SEO data, articles, documents, translations) is migrated with old URLs preserved or redirected with a single 301, verified in a test migration, and launched with a rollback plan and post-launch monitoring.

## Scope

- In: inventory; export and field mapping; taxonomy mapping with dedup; ambiguous values kept and flagged for manual review; repeatable migration scripts; test migration and checks on representative properties; redirect map and verification; final export before launch; rollback plan; monitoring of 404s, indexing, broken images, forms and analytics.
- Out: inventing historical statistics (the new counters start from a stated date).

## Tasks

Decomposed when the epic starts. Needs a database dump and the uploads folder (analysis Q2, Q9), which the product owner sends later; until then all epics use dummy seed data. The theme's built-in CRM is not used, so there are no leads or contacts to migrate.

## Notes

Public inventory, URL patterns and data quality issues already collected: [02-current-site.analysis.md](../../requirements/02-current-site.analysis.md).
