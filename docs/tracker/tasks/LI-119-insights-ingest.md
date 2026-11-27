# LI-119: Insights ingest + daily KPI

- Epic: EPIC-20
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-118

## Description

Upsert visitors/sessions on site events and session_ping; bump site_insight_daily; integration tests.

## Acceptance criteria

- [x] site-events accept visitorKey
- [x] session_ping updates engagedMs and daily rollup
- [x] Tests cover page_view → session/KPI and ping → duration

## Out of scope

- Admin UI

## Result

Extended public ingest + `POST /analytics/site-session-ping`; overview totals from daily rollups; integration test for bounce/duration/overview.
