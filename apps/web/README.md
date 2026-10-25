# Public web (`apps/web`)

Next.js App Router site. Locales: Bulgarian unprefixed, English under `/en/`.

## SEO helpers (LI-013)

| Module | Role |
|---|---|
| `src/lib/seo/paths.ts` | Locale paths, absolute URLs, hreflang map |
| `src/lib/seo/metadata.ts` | `buildPageMetadata` — title, description, canonical, hreflang, Open Graph |
| `src/lib/seo/json-ld.ts` | Thin `RealEstateListing` JSON-LD for property pages |

Pages call `buildPageMetadata({ locale, path, title, description, imageUrl? })`.  
`SITE_URL` (see root `.env.example`) is the canonical origin. Default social image: `/og-default.jpg` (replace with brand art when available). Property pages prefer the first gallery image.

## Sitemap, robots, redirects (LI-014)

- `app/sitemap.ts` — static pages + published properties for BG and EN.
- `app/robots.txt` via `app/robots.ts` — allows `/`, points at the sitemap.
- `lib/seo/redirects.ts` + `proxy.ts` — exact-path 301 table (sample `/oferti` → `/obiavi`); full legacy map is EPIC-17.
