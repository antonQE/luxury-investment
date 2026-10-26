# LI-064: Viewings schema + admin API

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-059, LI-061

## Description

Viewings linked to property, contact, agent, schedule and outcome status (CRM-003 basic).

## Acceptance criteria

- [x] `viewings` table + statuses; seed demo rows.
- [x] Admin CRUD/list API with date range filter.
- [x] Tests for create/update outcome.

## Out of scope

- Calendar UI (LI-065); external calendar sync.

## Result

Migration `0020_magical_rumiko_fujikawa.sql`; admin GET/POST/PATCH `/viewings` with `from`/`to` filters; seed confirmed viewing; gated by `inquiries:read/write`. Tests green.
