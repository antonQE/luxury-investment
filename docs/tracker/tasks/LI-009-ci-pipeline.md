# LI-009: CI pipeline

- Epic: EPIC-01
- Status: Backlog
- Priority: P1
- Size: S
- Area: infra
- Depends on: LI-006, LI-007, LI-008; a remote repository (host not chosen yet)

## Description

Run the same checks as the local Git hooks on every push and pull request, once the repository has a remote.

## Acceptance criteria

- [ ] Pipeline: install with the lockfile, format check, lint, type check, unit tests, API integration tests against a Postgres service, build of all apps.
- [ ] Dependency audit (high severity fails).
- [ ] The pipeline reports status only; it never approves or merges.

## Out of scope

- Deployment (hosting ADR).

## Implementation notes

## Result
