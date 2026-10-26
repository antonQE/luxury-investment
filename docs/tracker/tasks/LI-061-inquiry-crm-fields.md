# LI-061: Inquiry CRM fields (contact, source, funnel)

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-059

## Description

Extend inquiries with optional contact link, source/UTM, assigned agent, funnel stage and next-action fields (CRM-002).

## Acceptance criteria

- [x] Schema migration for new inquiry columns (nullable for existing rows).
- [x] Public create still works; admin list/filter by stage/source.
- [x] On create, optional match-by-email to existing contact (no auto-overwrite).
- [x] Tests for public create + admin filter.

## Out of scope

- Full assignment/reminder engine; merge UI.

## Implementation notes

- Shared enums: `INQUIRY_SOURCES`, `INQUIRY_FUNNEL_STAGES`; optional UTM + source on public create.
- Columns on `inquiries`: `contact_id`, `source`, UTM fields, `assigned_agent_id`, `funnel_stage` (default `new`), `next_action_at`, `next_action_note`.
- On create: link `contact_id` when an active contact email matches (case-insensitive); never update the contact.
- Admin `GET /inquiries?funnelStage=&source=` filters.

## Result

Migration `0019_quiet_the_hand.sql`; public create defaults `source=property_form` and links matching contacts; admin list filters by stage/source; seed CRM fields + linked Иванов inquiry. Tests green.
