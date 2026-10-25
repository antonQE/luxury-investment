# LI-014: Sitemap, robots and redirect skeleton

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-013

## Description

`sitemap.xml`, `robots.txt`, and a redirect table wired in `proxy.ts` with HTTP 301 for legacy/changed slugs (empty or sample rows until migration).

## Acceptance criteria

- [x] Sitemap lists home, static pages and published property URLs for both locales.
- [x] Robots allows public pages and points to the sitemap.
- [x] Redirect lookup returns 301; miss falls through; at least one sample redirect tested.
- [x] Unit or e2e-style check for a redirect path.

## Out of scope

- Full legacy URL map from WordPress (EPIC-17).

## Implementation notes

- Sample redirects: `/oferti` → `/obiavi`, plus one demo legacy property slug.
- Sitemap paginates public properties from the API.

## Result

- `sitemap.ts`, `robots.ts`, `lib/seo/redirects.ts` wired in `proxy.ts` with HTTP 301.
- Tests cover lookup + proxy 301; live `/oferti/` → 301.
