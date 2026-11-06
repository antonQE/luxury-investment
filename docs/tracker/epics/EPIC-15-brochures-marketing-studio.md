# EPIC-15: Brochures, print and marketing studio

- Status: Done
- Priority: P1 (channel copy P2)
- Source: 07 MEDIA-005, MEDIA-006; 03 PROP-PAGE-004; 11 G-03, G-04, C-04; FLOW-011; MEDIA-ACCEPT 3, 4

## Goal

From a property, a permitted user generates a branded PDF brochure and social assets (feed 1080x1350, square, story 1080x1920, landscape 1200x630) from the approved catalog data, toggling elements such as price, logo, contact and photos, with a preview, and copies channel texts in BG/EN.

## Scope

- In: brochure templates per property kind; element toggles and preview; social asset templates with badges (New, Exclusive, Price reduced, Sold, Investment); channel text variants with **manual** confirmation; QR code to the current URL; admin-managed template settings.
- Out: direct publishing to Meta or portals (EPIC-18); **AI writing / LLM copy** (explicitly excluded from R3).

## Tasks

- LI-084: PDF and social image rendering ADR — Done
- LI-085: Brochure templates schema + seed — Done
- LI-086: Property brochure PDF generate API — Done
- LI-087: Marketing studio admin UI (basic) — Done
- LI-088: Social asset image export — Done
- LI-089: Studio channel copy snippets (BG/EN) — Done

## Notes

R3 decomposition 2026-11-03 (no AI assistant). Rendering: [ADR-0013](../../adr/0013-pdf-and-image-rendering.md).
Closed 2026-11-03 after LI-084..089.
