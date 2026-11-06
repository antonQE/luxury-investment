# LI-094: Content publish-at scheduling (basic)

- Epic: EPIC-12
- Status: Done
- Priority: P2
- Size: M
- Area: api
- Depends on: LI-044

## Description

Optional `publishAt` for articles/landings so content can be scheduled without an AI or full approval matrix (CONTENT-001 basic slice).

## Acceptance criteria

- [x] `publishAt` field; public APIs only return content when due and published.
- [x] Admin can set/clear publishAt.
- [x] Test for future-dated content hidden from public.

## Out of scope

- Multi-role approval workflow; AI tools; calendar sync.

## Implementation notes

- Reuses `publishedAt` as the schedule gate; publish endpoints accept optional ISO `publishAt`.
- Public articles/pages/landings require `publishedAt <= now`.

## Result

Scheduled articles stay status=published but are 404 until due; integration test green.
