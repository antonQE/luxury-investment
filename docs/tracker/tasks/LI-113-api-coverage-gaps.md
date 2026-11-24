# LI-113: API endpoint gaps + coverage gate

- Epic: EPIC-19
- Status: Done
- Priority: P1
- Size: M
- Area: api, infra
- Depends on: LI-112

## Description

Close remaining API happy-path gaps and add Vitest coverage gate for `apps/api`.

## Acceptance criteria

- [x] Integration coverage for: admin partners, FX PUT, CRM task get/patch, studio templates + exports list, media list/archive, site-settings admin GET if missing.
- [x] `@vitest/coverage-v8` + `test:coverage` with ≥75% lines / ≥55% branches (floor vs regression; suite sits ~84% lines / ~60% branches).
- [x] CI runs API coverage gate.

## Out of scope

- Coverage gates for admin/web; rewriting existing green tests.

## Result

Extended team/exchange-rates/crm-tasks/media/studio/site-settings integration tests. Added `test:coverage` + CI step; `maxWorkers: 1` for coverage stability against Postgres deadlocks. Branch floor set to 55% (measured ~60%) rather than an unreachable 70% without a large branch-focused test expansion.
