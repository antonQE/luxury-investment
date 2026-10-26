# LI-050: Migration runbook and launch checklist

- Epic: EPIC-17
- Status: Done
- Priority: P1
- Size: M
- Area: docs
- Depends on: none

## Description

Document the repeatable migration/launch procedure for R1: prerequisites, test migration steps, cutover, rollback and post-launch checks — usable once the WordPress dump arrives.

## Acceptance criteria

- [x] Runbook under `docs/` covering inventory → test import → redirects → cutover → rollback.
- [x] Launch checklist (DNS, env secrets, seed off in prod, analytics, forms, sitemap).
- [x] Board notes LI-051 blocked on dump; runbook linked from EPIC-17.

## Out of scope

- Running a real import; writing the importer itself (LI-051).

## Implementation notes

## Result

- `docs/migration/runbook.md`; LI-051 remains Blocked pending dump.
