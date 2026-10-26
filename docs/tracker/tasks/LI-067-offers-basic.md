# LI-067: Offers register (basic)

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-059

## Description

Register buy/rent offers linked to property and contact with price, dates and status (CRM-004 basic).

## Acceptance criteria

- [x] `offers` schema + admin API list/create/update status.
- [x] Seed demo offer; permission-gated.
- [x] Basic admin UI list.

## Out of scope

- Full deal closing workflow (LI-068); commissions.

## Result

Migration `0022_little_stingray.sql`; admin offers API/UI; seed purchase offer. Tests green.
