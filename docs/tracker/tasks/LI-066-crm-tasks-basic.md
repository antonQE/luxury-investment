# LI-066: CRM tasks schema + basic admin

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-059

## Description

Configurable-ish task list for follow-ups (new inquiry, post-viewing) without a full rules engine yet.

## Acceptance criteria

- [x] `crm_tasks` table (assignee, due, status, related inquiry/viewing/property).
- [x] Admin list + create + complete API/UI basic.
- [x] Seed a couple of overdue/upcoming tasks.

## Out of scope

- Full admin-configurable automation rules; email reminders.

## Result

Migration `0021_goofy_leo.sql`; admin `/crm-tasks` list/create/complete; seed overdue + upcoming. Tests green.
