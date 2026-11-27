# EPIC-20: Site Insights KPI overview

- Status: Done
- Priority: P1
- Source: docs/requirements/03-site-insights-kpis.md + analysis; ADR-0015

## Goal

Admin Analytics shows first-party overview KPIs with range presets, previous-period deltas, and metric tooltips.

## Scope

- In: schema, ingest/pings, web dual ids + engaged time, admin overview UI, tests/docs
- Out: GA4 pull, geo/UTM charts, real-time dashboard, paid SaaS

## Tasks

- LI-118: Schema + migration
- LI-119: Ingest + daily KPI bump + API tests
- LI-120: Web visitor/session + heartbeat
- LI-121: Admin overview API + KPI cards + tooltips
- LI-122: E2E/docs + retention backlog note

## Notes

ADR-0015. Extends EPIC-11 / LI-108.
