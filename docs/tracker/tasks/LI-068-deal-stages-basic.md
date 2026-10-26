# LI-068: Deal stages (basic)

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-067

## Description

Minimal deal record with stage lifecycle separate from inquiry/client status (CRM-004).

## Acceptance criteria

- [x] `deals` schema with stage enum and links to property/contacts/offer.
- [x] Admin API to create and move stage.
- [x] Basic admin UI; no commission fields for unauthorized roles.

## Out of scope

- Payments, notary workflow, multi-market closing variants, finance permissions UI polish beyond gate.

## Result

Migration `0023_simple_captain_marvel.sql`; deals API/UI with stage moves; commission gated by `finance:read`. Tests green.
