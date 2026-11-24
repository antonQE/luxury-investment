# LI-115: E2E Tasks / Analytics / Documents

- Epic: EPIC-19
- Status: Done
- Priority: P1
- Size: M
- Area: e2e, admin
- Depends on: LI-114

## Description

Playwright for Tasks section tabs/redirects, Analytics page, Documents/Handbook tabs.

## Acceptance criteria

- [x] `/tasks` redirects; tabs Marketing / Studio / CRM; legacy path redirects.
- [x] Analytics page loads (tables or empty).
- [x] Documents + Handbook section nav works.

## Out of scope

- Full studio PDF generation in e2e; analytics data seeding beyond empty/seed state.

## Result

Added `apps/e2e/src/admin/ops.spec.ts` covering Tasks tabs + legacy redirects, Analytics load, Documents/Handbook section nav. Green with admin auth setup.
