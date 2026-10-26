# LI-061: Inquiry CRM fields (contact, source, funnel)

- Epic: EPIC-09
- Status: Backlog
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-059

## Description

Extend inquiries with optional contact link, source/UTM, assigned agent, funnel stage and next-action fields (CRM-002).

## Acceptance criteria

- [ ] Schema migration for new inquiry columns (nullable for existing rows).
- [ ] Public create still works; admin list/filter by stage/source.
- [ ] On create, optional match-by-email to existing contact (no auto-overwrite).
- [ ] Tests for public create + admin filter.

## Out of scope

- Full assignment/reminder engine; merge UI.
