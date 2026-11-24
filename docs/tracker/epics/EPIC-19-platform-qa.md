# EPIC-19: Platform QA

- Status: Done
- Priority: P1
- Source: Owner request 2026-11-24 — happy-path coverage + API coverage gate (hybrid)

## Goal

Critical happy paths are covered by automated tests; known P0/P1 bugs from the QA pass are fixed; `apps/api` has a Vitest coverage gate in CI.

## Scope

- In: bug audit fixes; API endpoint gap tests + coverage tooling; admin CRM/ops e2e; targeted unit/component tests for high-risk UI; QA guide.
- Out: 80% line coverage of every React page; visual/a11y/load suites; LI-111 deal agent totals (product).

## Tasks

- LI-112: Bug audit + P0/P1 fixes
- LI-113: API endpoint gaps + coverage gate
- LI-114: E2E admin CRM (contacts, viewings, deals)
- LI-115: E2E Tasks / Analytics / Documents
- LI-116: Unit/component tests for analytics + Deals + Team languages
- LI-117: Full suite green + QA guide

## Notes

Hybrid approach: happy paths everywhere; coverage threshold only for `apps/api`.
