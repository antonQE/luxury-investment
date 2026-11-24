# LI-109: Unify Marketing, Studio and CRM Tasks under Tasks

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: S
- Area: admin
- Depends on: —

## Description

Owner feedback: in the admin panel, Marketing, Studio and CRM Tasks should be unified under a single sidebar item “Tasks”, with in-page tabs (same pattern as Documents / Handbook).

## Acceptance criteria

- [x] Admin sidebar has a single Tasks item (no separate Marketing, Studio or CRM Tasks items).
- [x] In-page tabs: Marketing, Studio, CRM Tasks (in that order).
- [x] Canonical routes under `/tasks/*`; old `/marketing`, `/studio`, `/crm-tasks` redirect.

## Out of scope

- Merging the three UIs into one page; API path changes.

## Result

Sidebar **Tasks** → `/tasks` redirects to Marketing. Tabs switch `/tasks/marketing`, `/tasks/studio`, `/tasks/crm`. Legacy paths redirect.
