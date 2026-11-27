# LI-121: Admin Insights overview UI

- Epic: EPIC-20
- Status: Done
- Priority: P1
- Size: M
- Area: admin, api
- Depends on: LI-120

## Description

Overview API + KPI cards with range, deltas, tooltips; tables share range.

## Acceptance criteria

- [x] GET overview for 1d/7d/30d/90d/180d with previous period
- [x] Six KPI cards + tooltips (bg/en)
- [x] Pages/clicks use selected range

## Out of scope

- Charts / geo

## Result

`GET /v1/admin/analytics/overview`; AnalyticsPage KPI strip + range select; i18n tooltips; tables use selected days.
