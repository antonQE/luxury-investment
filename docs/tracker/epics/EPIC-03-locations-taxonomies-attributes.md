# EPIC-03: Locations, markets, taxonomies and dynamic attributes

- Status: Backlog
- Priority: P1
- Source: 02 §1, §8, §9; 08 MARKET-001, MARKET-003; 03 SRCH-003; 11 B-01, B-02, B-04, H-04; FLOW-004

## Goal

Admins manage every list the catalog uses (location hierarchy, markets, property types, transaction types, construction types and stages, statuses, badges, attribute definitions and options) with translations, without code changes, and with archive/merge instead of destructive delete.

## Scope

- In: data model ADR (dynamic attributes, translations, location hierarchy); location hierarchy country → region → city → district → complex; markets independent of geography; attribute definitions (type, unit, validation, options, applicability per type/market, required, public, filterable, order, help text, translations); duplicate prevention and merge; usage view; admin CRUD screens; seed data for BG construction stages (building permit, Act 14, Act 15, Act 16) and the three markets.
- Out: property records (EPIC-04); public filters UI (EPIC-07).

## Tasks

Decomposed when the epic starts. First task: data model ADR (analysis R3, R10). Seed the reference lists from the public inventory of the current site ([02-current-site.analysis.md](../../requirements/02-current-site.analysis.md#inventory)), deduplicated.
