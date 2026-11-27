# Analysis: Site Insights KPIs

Source: [03-site-insights-kpis.md](03-site-insights-kpis.md)
Date: 2026-11-27

## Summary

Admin overview KPI strip (MonsterInsights-style) for the public site: sessions, pageviews, avg session duration, total users, new users, bounce rate — with range presets and previous-period comparison, plus tooltips. Built on first-party beacons already in the monorepo.

## Features

### Public site
- Persistent visitor id + short-lived session id (30 min idle)
- Heartbeat / engaged-time pings and pagehide flush

### Admin panel
- Range selector (1d / 7d / 30d / 90d / 180d)
- Six KPI cards with delta % and info tooltips
- Existing pages/clicks tables filtered by the same range

### Backend / data
- `visitorKey` on site events; visitors + sessions tables; daily insight rollups
- Overview API aggregates from rollups (+ distinct users from sessions)

### Infrastructure / integrations
- No third-party analytics product

## Assumptions
- First-party only at this traffic level
- Bounce = single page_view session
- Existing property views / owner reports unchanged

## Open questions
- [x] Q1: First-party vs GA4 — decided first-party
- [x] Q2: Include bounce + tooltips — yes

## Technology risks
### R1: Summing daily unique users overcounts across days
- Recommendation: sum additive metrics from daily rows; compute period users via distinct session visitors
- Decision: ADR-0015

## Proposed epics
- EPIC-20: Site Insights KPI overview
