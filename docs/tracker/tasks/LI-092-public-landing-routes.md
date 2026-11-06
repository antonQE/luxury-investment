# LI-092: Public landing routes + inquiry attribution

- Epic: EPIC-12
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-091

## Description

Render published landings on the public site with campaign tracking on inquiry forms (CONTENT-003).

## Acceptance criteria

- [x] Public route for landing slug (BG/EN); not forced into main nav.
- [x] CTA form posts inquiry with source/UTM or landing id attribution.
- [x] SEO meta from landing fields; 404 when unpublished.

## Out of scope

- A/B testing; AI content.

## Implementation notes

- `GET /v1/public/landings/:slug`; web `/kampanii/[slug]`.
- CTA uses inquiry `source=landing` + utmCampaign/utmContent from landing/campaign.

## Result

Public API + Next route + section renderer; tests green.
