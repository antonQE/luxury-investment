# LI-083: Owner report basic (JSON + admin)

- Epic: EPIC-11
- Status: Backlog
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-082

## Description

One-button basic owner report assembling views rollups, price history, inquiries/viewings counts without buyer PII (RPT-001 basic).

## Acceptance criteria

- [ ] Admin endpoint generates a report snapshot for a property + period.
- [ ] Snapshot stored (append-only versions).
- [ ] No buyer personal data in payload.
- [ ] Integration test for generate + list.

## Out of scope

- PDF/image export polish; GA4/Search Console; alerts.
