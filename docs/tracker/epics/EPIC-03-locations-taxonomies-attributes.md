# EPIC-03: Locations, markets, taxonomies and dynamic attributes

- Status: Done
- Priority: P1
- Source: 02 §1, §8, §9; 08 MARKET-001, MARKET-003; 03 SRCH-003; 11 B-01, B-02, B-04, H-04; FLOW-004

## Goal

Admins manage every list the catalog uses (location hierarchy, markets, property types, transaction types, construction types and stages, statuses, badges, attribute definitions and options) with translations, without code changes, and with archive/merge instead of destructive delete.

## Scope

- In: data model ADR (dynamic attributes, translations, location hierarchy); location hierarchy country → region → city → district → complex; markets independent of geography; attribute definitions (type, unit, validation, options, applicability per type/market, required, public, filterable, order, help text, translations); duplicate prevention and merge; usage view; admin CRUD screens; seed data for BG construction stages (building permit, Act 14, Act 15, Act 16) and the three markets.
- Out: property records (EPIC-04); public filters UI (EPIC-07).

## Tasks

- LI-021: Catalog data model ADR (Done) — [ADR-0009](../../adr/0009-catalog-data-model.md)
- LI-022: Locations schema and seed
- LI-023: Markets and core taxonomies schema + seed
- LI-024: Attribute definitions schema + seed
- LI-025: Admin taxonomy and location CRUD (basic)

Seed reference lists from the public inventory ([02-current-site.analysis.md](../../requirements/02-current-site.analysis.md#inventory)), deduplicated.
