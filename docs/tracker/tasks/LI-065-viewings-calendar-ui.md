# LI-065: Viewings calendar UI (basic)

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: L
- Area: admin
- Depends on: LI-064

## Description

Day/week/month calendar of viewings with overlap warning and filters by agent.

## Acceptance criteria

- [x] Admin calendar page backed by viewings API.
- [x] Overlap warning when two viewings share agent+time.
- [x] Create/reschedule/decline from UI (basic).

## Out of scope

- Google/Outlook sync; mobile-native calendar.

## Result

Admin `/viewings` calendar (day/week/month), agent filter, create/reschedule/decline, overlap warning + unit tests.
