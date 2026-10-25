# LI-013: SEO metadata foundation

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-012

## Description

Shared helpers for title, description, canonical, hreflang and Open Graph on home, listings and property pages (and static pages).

## Acceptance criteria

- [x] Helpers in `apps/web` used by home, `/obiavi/`, `/obiavi/[slug]/`, about, services, contact.
- [x] Canonical and hreflang for BG (unprefixed) and EN (`/en/...`).
- [x] Open Graph title, description and image (property primary image or site default).
- [x] Documented in architecture or a short web README note.

## Out of scope

- Sitemap/robots/redirect table (LI-014); JSON-LD property schema can be a thin first version here or follow-up.

## Implementation notes

- `lib/seo/paths.ts` + `metadata.ts` + thin `json-ld.ts`.
- Wire home, listings, property, about, services, contact (+ investment stubs).
- Document in `apps/web/README.md` and architecture tree note.

## Result

- `buildPageMetadata` + path/hreflang helpers; property JSON-LD; `/og-default.jpg`.
- Wired on home, listings, property, about, services, contact and investment stubs.
- Documented in `apps/web/README.md`; unit tests for paths pass.
