# LI-118: Insights schema + migration

- Epic: EPIC-20
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Add visitorKey on site_events plus visitors, sessions, and site_insight_daily tables.

## Acceptance criteria

- [x] Drizzle schema + generated migration
- [x] Exported from infrastructure schema barrel
- [x] Seed module untouched or idempotent if needed (empty tables OK)

## Out of scope

- Ingest behaviour (LI-119)

## Implementation notes

Extend `analytics.schema.ts`; run `db:generate`.

## Result

Added `visitorKey` on `site_events`, tables `analytics_visitors`, `analytics_sessions`, `site_insight_daily`; migration `0035_dizzy_bulldozer.sql`.
