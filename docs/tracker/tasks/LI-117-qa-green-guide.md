# LI-117: Full suite green + QA guide

- Epic: EPIC-19
- Status: Done
- Priority: P1
- Size: S
- Area: docs, infra
- Depends on: LI-116

## Description

Confirm `npm test` and e2e green; document how to run QA / coverage.

## Acceptance criteria

- [x] Unit/integration suites green for touched workspaces.
- [x] E2E green (or documented skip only if env-blocked).
- [x] `docs/guides/qa.md` with commands and what is covered.

## Out of scope

- New product features.

## Result

Added `docs/guides/qa.md` (linked from guides README). API coverage gate passes (≥75% lines / ≥55% branches). Admin CRM + ops e2e green; web/admin high-risk unit tests green.
