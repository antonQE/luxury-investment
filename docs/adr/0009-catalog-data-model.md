# 0009: Catalog data model (locations, taxonomies, attributes, translations)

- Status: Accepted (delegated)
- Date: 2026-10-25
- Related: analysis R3, R10; EPIC-03; EPIC-04

## Context

The catalog needs admin-editable lists (locations, markets, types, badges, attribute definitions) with BG/EN labels, archive/merge instead of hard delete, and filterable attributes without a code deploy. Wrong storage makes search slow or validation impossible.

## Options considered

1. **Pure EAV** — one row per property per attribute. Flexible; painful list queries.
2. **Everything in one JSONB** — simple; weak referential integrity for options/merge.
3. **Hybrid (recommended in analysis R3)** — universal/filter-heavy fields as columns; admin-defined attributes in JSONB validated against `attribute_definitions`; select options as rows; translations as rows keyed by `(entity_type, entity_id, locale, field)`.

## Decision

**Option 3: Hybrid.**

- **Locations**: adjacency hierarchy `country → region → city → district → complex` in `locations` (`parent_id`, `kind`, `slug`, `code`, soft `archived_at`).
- **Markets**: independent of geography (`markets` + optional `market_locations` links).
- **Taxonomies**: typed lists (`property_types`, `transaction_types`, `badges`, `construction_stages`, `statuses`, …) with `key`, sort order, archive.
- **Translations**: `translations` table `(entity_type, entity_id, locale, field, value)` — not columns per language.
- **Attributes**: `attribute_definitions` + `attribute_options`; property values later in EPIC-04 as JSONB keyed by definition id, validated in the service layer; GIN when filtering lands.
- **Merge/archive**: never hard-delete referenced rows; `archived_at` + merge maps in follow-up tasks.

## Consequences

- LI-022+ implement schema and seeds from the current-site inventory (deduped).
- Public serializers stay narrow (ADR-0005 snapshot evolves toward this model in EPIC-04).
- Supersedes the “pending” note on analysis R3/R10 for Release 1 shape.
