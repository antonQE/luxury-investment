# LI-082: Property event tracking schema + ingest

- Epic: EPIC-11
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: none

## Description

Internal event collection for property page views and key actions, with daily rollups (ANL-001).

## Acceptance criteria

- [x] Tables: property_events, property_event_daily_rollups.
- [x] Public POST ingest for allowed event types (bot filter basic).
- [x] Seed/demo rollup optional; unit/integration test for ingest → count.

## Out of scope

- GA4 wiring; owner PDF; consent UI changes beyond existing cookie gate note.

## Result

Migration `0028_blushing_secret_warriors.sql`; `POST /v1/public/analytics/events` with honeypot + UA bot filter; daily rollups; integration test green.
