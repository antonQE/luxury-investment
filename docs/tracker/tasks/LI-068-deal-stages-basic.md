# LI-068: Deal stages (basic)

- Epic: EPIC-09
- Status: Backlog
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-067

## Description

Minimal deal record with stage lifecycle separate from inquiry/client status (CRM-004).

## Acceptance criteria

- [ ] `deals` schema with stage enum and links to property/contacts/offer.
- [ ] Admin API to create and move stage.
- [ ] Basic admin UI; no commission fields for unauthorized roles.

## Out of scope

- Payments, notary workflow, multi-market closing variants, finance permissions UI polish beyond gate.
