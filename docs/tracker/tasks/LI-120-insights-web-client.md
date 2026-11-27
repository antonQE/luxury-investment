# LI-120: Web visitor/session + heartbeat

- Epic: EPIC-20
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-119

## Description

Split visitor/session ids; send both on beacons; heartbeat engaged time.

## Acceptance criteria

- [x] Persistent visitor + session with 30 min idle refresh
- [x] SiteAnalytics heartbeat + pagehide flush
- [x] Unit tests for helpers

## Out of scope

- Admin cards

## Result

`session.ts` visitor/session split (legacy key migration); `trackSiteSessionPing`; SiteAnalytics interval + visibility/pagehide; unit tests.
