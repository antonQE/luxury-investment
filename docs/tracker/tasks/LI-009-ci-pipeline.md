# LI-009: CI pipeline

- Epic: EPIC-01
- Status: Done
- Priority: P1
- Size: S
- Area: infra
- Depends on: LI-006, LI-007, LI-008; remote repository

## Description

Run the same checks as the local Git hooks on every push and pull request, once the repository has a remote.

## Acceptance criteria

- [x] Pipeline: install with the lockfile, format check, lint, type check, unit tests, API integration tests against a Postgres service, build of all apps.
- [x] Dependency audit (high severity fails).
- [x] The pipeline reports status only; it never approves or merges.

## Out of scope

- Deployment (hosting ADR).

## Implementation notes

- GitHub Actions on `master` and pull requests (repo host: github.com/antonQE/luxury-investment).
- Single `ci` job with a Postgres 18 service; `TEST_DATABASE_URL` points at it so API integration tests and Drizzle migrate run like locally.
- `HUSKY=0` on `npm ci` so prepare does not install hooks in CI.
- Scripts match the root package: `format:check`, `lint`, `typecheck`, `test`, `build`, plus `npm audit --audit-level=high`.

## Result

Added `.github/workflows/ci.yml`: single job on `master` pushes and all PRs with Postgres 18 service, `npm ci` (`HUSKY=0`), `npm audit --audit-level=high`, typecheck (before lint so `next typegen` exists), format check, lint, test, build. README documents the pipeline. First Actions run failed on lint without generated Next types; fixed by ordering typecheck before lint. Green run: https://github.com/antonQE/luxury-investment/actions/runs/40231151955
