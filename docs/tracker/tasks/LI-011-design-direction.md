# LI-011: Public site design direction

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: M
- Area: docs
- Depends on: none

## Description

Propose a concrete design direction for the public site (typography, color tokens, hero/list/detail wireframes) for product-owner approval before refining chrome and pages. References: savoirproperties.com (look), imotireplace.bg (function), luxuryinvestment.framer.ai (seller content), original logo when available.

## Acceptance criteria

- [x] A short written direction in `docs/` (colors, type, spacing, do/don't) and 2–3 static mock or live prototype screens (home hero, listings, property).
- [x] Uses the temporary tokens from LI-010 as a starting point or proposes a clear replacement (avoid generic purple/AI defaults).
- [x] Product owner can approve, request changes, or reject with notes in one review.

## Out of scope

- Implementing the full nav tree, SEO helpers, redirects (later EPIC-06 tasks).

## Implementation notes

- Direction name: “Gallery Stone” — cool stone ground, void heroes, brass accent, Source Serif 4 + Source Sans 3.
- Written proposal: `docs/design/public-site-direction.md`.
- Live prototype: update CSS tokens on `/`, `/obiavi/`, property page (aliases cream/gold → stone/brass values).

## Result

- Direction **Gallery Stone**: `docs/design/public-site-direction.md`.
- Live prototype tokens on the public site (cool stone ground, void heroes, brass accent).
- Auth: ADR-0006 accepted as email+password; ADR-0007 search Postgres accepted; LI-018 Ready.
- Approved by product owner on 2026-10-25.
