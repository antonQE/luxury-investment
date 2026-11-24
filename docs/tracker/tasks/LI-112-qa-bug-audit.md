# LI-112: QA bug audit + P0/P1 fixes

- Epic: EPIC-19
- Status: Done
- Priority: P1
- Size: M
- Area: web, admin, docs
- Depends on: —

## Description

First wave of Platform QA: audit recent analytics/deals/tasks work and fix P0/P1 bugs.

## Acceptance criteria

- [x] SiteAnalytics click labels null-safe for `textContent`.
- [x] PropertyViewBeacon sends again when `propertyId` changes.
- [x] Deals agent select hydrates from logged-in user without empty stuck state.
- [x] Findings recorded in Result (P2 → backlog if any).

## Out of scope

- New e2e/unit suites (later LI-114..116); API coverage gate (LI-113).

## Result

- SiteAnalytics: typed null check before `replace`.
- PropertyViewBeacon: track last sent `propertyId` instead of one-shot boolean.
- DealsList: `effectiveAgentId` falls back to `user.id` when state still empty after auth hydrate.
- P2 (documented, not fixed): agent picker options only from current user + property responsible agents + existing deals (no full staff directory) — optional follow-up if multi-agent orgs need it.
