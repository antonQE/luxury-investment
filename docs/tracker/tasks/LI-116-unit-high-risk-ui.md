# LI-116: Unit/component tests for high-risk UI

- Epic: EPIC-19
- Status: Done
- Priority: P1
- Size: M
- Area: web, admin
- Depends on: LI-115

## Description

Targeted tests for analytics beacons, Deals agent, Team languages parse.

## Acceptance criteria

- [x] SiteAnalytics page_view dedupe + click payload.
- [x] PropertyViewBeacon once-per-propertyId.
- [x] DealsList agent default/required behaviour covered.
- [x] Team languages string → array write-body covered (extract or component).

## Out of scope

- Full page coverage for every admin screen.

## Result

Web: `site-analytics.component.test.tsx`, `property-view-beacon.component.test.tsx`. Admin: `resolveDealAgentId` + DealsList agent component tests; exported `parseLanguagesCsv` + unit test; optional TasksSectionNav component test.
