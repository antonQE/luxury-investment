# LI-110: Deal agent assignment

- Epic: EPIC-09
- Status: Done
- Priority: P1
- Size: S
- Area: api, admin, shared
- Depends on: LI-068

## Description

Owner feedback: Deals menu should show which agent owns the deal. Totals by agent can come later.

## Acceptance criteria

- [x] `deals.agent_id` links to staff user; seed backfilled.
- [x] Admin create/list/update expose agent; table shows agent name.
- [x] Create form lets you pick an agent (defaults to current user / property responsible agent).

## Out of scope

- Per-agent totals / summary table (follow-up LI-111).

## Result

Migration `0034`: `agent_id` on deals (backfill from property responsible agent / first user). Admin Deals: agent column + create/change select. Tests green.
