# LI-028: Admin properties API (CRUD + publish)

- Epic: EPIC-04
- Status: Done
- Priority: P1
- Size: L
- Area: api
- Depends on: LI-026

## Description

Authenticated admin API to list, create, update, publish and archive properties with permission checks and basic pre-publish validation (responsible agent required).

## Acceptance criteria

- [x] `/v1/admin/properties` list/create/update/archive/publish with `properties:*` permissions.
- [x] Draft save without publish; publish rejects missing responsible agent.
- [x] Integration tests cover happy path + forbidden.

## Out of scope

- Stepped autosave UI; media upload; duplicate action (LI-030).

## Implementation notes

- Price/slug history recorded on update via `PropertyHistoryService`.

## Result

- Admin routes wired in `main.ts`; publish requires `responsibleAgentUserId`.
- Integration tests: draft → reject publish → assign agent → publish → archive; unauthenticated 401.
