# 0007: Public search with Postgres

- Status: Accepted
- Date: 2026-10-25
- Related: analysis R11; EPIC-07

## Context

Release 1 needs filterable listings, free text (BG/EN), reference-number lookup, and map display of approximate locations. Full attribute-configurable search arrives with EPIC-03/04; until then the denormalized snapshot (ADR-0005) is the source.

## Options considered

1. **Postgres only** — indexed columns, later JSONB GIN for attributes; `pg_trgm` + `unaccent` for text; bounding-box queries for maps; Google Maps on the client for display. Pros: one system, already in the stack. Cons: no Bulgarian stemmer (acceptable for R1).
2. **External search (Meilisearch / Elasticsearch)** — Pros: richer ranking. Cons: another service for little gain at ~136 listings.
3. **PostGIS from day one** — Pros: spatial ops. Cons: extra complexity before we need it.

## Decision

**Option 1 (Postgres only).** Accepted with the public-site track on 2026-10-25. PostGIS only if needs grow. Google Maps client-side with an API key when maps ship (separate env + billing).

## Consequences

- List/detail filters stay on the API; free-text and map viewport become follow-up tasks on the same stack.
- Exact coordinates never leave the API for approximate listings.
