# LI-051: WordPress/data import scripts

- Epic: EPIC-17
- Status: Blocked
- Priority: P1
- Size: L
- Area: api
- Depends on: LI-050
- Blocked reason: Waiting for WordPress database dump and uploads folder from the product owner (analysis Q2, Q9).

## Description

Repeatable scripts that import properties, media, taxonomies, articles and related entities from the current site export into the new schema, with dry-run and idempotent re-runs.

## Acceptance criteria

- [ ] Import CLI/script with dry-run; maps fields per the runbook.
- [ ] Taxonomy dedup with flagged ambiguous values.
- [ ] Test import against a dump fixture succeeds for a representative sample.

## Out of scope

- Live cutover; inventing historical analytics.

## Implementation notes

## Result
