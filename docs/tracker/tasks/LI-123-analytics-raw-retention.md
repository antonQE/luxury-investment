# LI-123: Prune raw analytics events

- Epic: EPIC-20
- Status: Backlog
- Priority: P3
- Size: S
- Area: api
- Depends on: LI-122

## Description

Optional retention job to delete raw `site_events` / `property_events` older than ~180 days while keeping daily rollups and insight KPIs.

## Acceptance criteria

- [ ] Documented retention window
- [ ] Safe prune that does not break overview KPIs

## Out of scope

- Changing KPI definitions

## Result

(pending)
