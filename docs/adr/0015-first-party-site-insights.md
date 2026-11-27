# 0015: First-party site Insights (visitor vs session)

- Status: Accepted (delegated)
- Date: 2026-11-27
- Related: docs/requirements/03-site-insights-kpis.analysis.md, EPIC-20

## Context

Admin needs GA-style overview KPIs (sessions, pageviews, duration, users, new users, bounce) with period comparison. Traffic is ~3–4k visits/month. The existing `li_analytics_session` localStorage key is long-lived and behaves like a visitor id, not a session.

## Options considered

1. GA4 Data API into admin — free at this volume, but credentials/consent coupling and less control
2. Paid SaaS (Plausible / MonsterInsights) — unnecessary cost
3. Extend first-party events with visitor/session split + daily KPI rollups — reuses LI-108

## Decision

Option 3. Persist `visitorId` (localStorage) and `sessionId` (sessionStorage + 30-minute idle). Store raw site events with both keys; maintain `analytics_visitors`, `analytics_sessions`, and `site_insight_daily`. Admin overview reads rollups (and distinct users from sessions), not full raw scans.

## Consequences

- No third-party analytics invoice; Postgres growth is modest at current traffic
- Duration/bounce require client heartbeats
- Raw retention prune can be a later backlog task if disk grows
