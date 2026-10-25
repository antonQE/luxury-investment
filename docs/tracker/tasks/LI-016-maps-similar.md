# LI-016: Maps link and similar properties

- Epic: EPIC-07
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-015; ADR-0007 accepted

## Description

Property page: link/open map for the listing location (exact or approximate per future flags), and a "similar" strip (same market + type, exclude self, newest).

## Acceptance criteria

- [x] Public API or serializer exposes what the map needs without leaking exact coords when approximate (placeholder flag ok until EPIC-03).
- [x] UI: Google Maps link or embed behind env key; graceful fallback if key missing.
- [x] Similar properties section with cards; empty state if none.

## Out of scope

- Map search / draw-on-map (EPIC-18).

## Implementation notes

- `locationPrecision: approximate` + `mapQuery` text; Google Maps search link (no API key required).
- `GET /properties/:slug/similar` by market + property type.

## Result

- Map link + approximate notice; similar strip with empty state; API/web tests green.
