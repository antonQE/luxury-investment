# LI-057: E2E + component test coverage

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: L
- Area: web
- Depends on: none

## Description

Add Playwright e2e (POM + `data-testid`) for R1 critical public and admin flows, plus Vitest + Testing Library component tests for high-value web/admin client UI. Wire root scripts and CI.

## Acceptance criteria

- [x] `apps/e2e` Playwright workspace with POM (`*.elements.ts` / `*.page.ts`) covering home, listings, property inquiry, consent, sell-with-us, EN locale, empty search, admin login/properties/inquiries.
- [x] Web and admin Vitest run `*.component.test.tsx` under jsdom with Testing Library for SearchForm, InquiryForm, SearchRequest, Consent, Gallery, Share, NavProgress, Login, RequireAuth, Dashboard health (and inquiries smoke).
- [x] Root scripts `test:e2e` / `test:e2e:ui`; CI migrates, seeds, installs Chromium and runs e2e after build.
- [x] README documents how to run unit and e2e tests; tracker Done when green.

## Out of scope

- Visual regression / Percy; exhaustive admin CRUD; load/perf; replacing API integration tests.

## Implementation notes

- E2E in `apps/e2e` (keeps Next/Vite apps clean). Component tests use `// @vitest-environment jsdom` (Vitest 5 dropped `environmentMatchGlobs`).
- Auth: Playwright `storageState` after one admin login (`admin@example.com` / seed password).
- Fixed async form `reset()` after `await` in Inquiry / SearchRequest / Consultation (React nullifies `event.currentTarget`).

## Result

- `apps/e2e` Playwright POM + public/admin specs; CI step after build.
- Web/admin Testing Library component suites; `npm test` and `npm run test:e2e` green locally against seeded DB.
