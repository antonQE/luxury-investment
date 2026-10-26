# LI-060: Property owners / co-owners + brokerage agreements

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-059

## Description

Link contacts to properties as owners/co-owners and store brokerage agreement dates on that link.

## Acceptance criteria

- [x] Join table property↔contact with role (owner/co-owner) and agreement start/end dates.
- [x] Admin API to list/set owners for a property (permission-gated).
- [x] Seed at least one demo ownership link.
- [x] Tests for create/list and soft constraints.

## Out of scope

- Full contract document upload; public owner data.

## Result

`property_ownerships` + admin GET/PUT/DELETE under `/v1/admin/properties/:id/owners`; seed links Demo Петрова to Malinova Dolina listing. Tests green.
