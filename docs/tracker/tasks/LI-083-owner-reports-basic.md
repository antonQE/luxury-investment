# LI-083: Owner report basic (JSON + admin)

- Epic: EPIC-11
- Status: Done
- Priority: P1
- Size: M
- Area: api
- Depends on: LI-082

## Description

One-button basic owner report assembling views rollups, price history, inquiries/viewings counts without buyer PII (RPT-001 basic).

## Acceptance criteria

- [x] Admin endpoint generates a report snapshot for a property + period.
- [x] Snapshot stored (append-only versions).
- [x] No buyer personal data in payload.
- [x] Integration test for generate + list.

## Out of scope

- PDF/image export polish; GA4/Search Console; alerts.

## Result

`POST/GET /v1/admin/analytics/owner-reports`; payload aggregates rollups, funnel counts and price history only; append-only snapshots; integration test green.
