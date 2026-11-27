# LI-125: English URLs for public site sections

- Epic: EPIC-06
- Status: Review
- Priority: P2
- Size: M
- Area: web, e2e
- Depends on: none
- Source: [05-english-section-urls.md](../../requirements/05-english-section-urls.md) (change request, product owner, 2026-11-27)

## Description

Public section paths must use plain English words instead of Bulgarian transliteration (“шлюкавица”), e.g. `/sell-with-us/` instead of `/prodai-s-nas/`. The same English segments apply for Bulgarian (unprefixed) and English (`/en/…`). Old transliteration URLs do not need redirects. Detail pages by id are a follow-up task (LI-126).

## Plain-language summary (BG)

Адресите на основните раздели на публичния сайт стават на английски (напр. `/sell-with-us/`, `/properties/`, `/team/`). Българският сайт остава без `/bg/` в адреса; английският — под `/en/`. Старите адреси на шлюкавица не се пренасочват. Конкретните обяви/статии/хора с ID са в LI-126.

## Acceptance criteria

- [x] Every fixed public section uses the English path map below (BG unprefixed and EN under `/en/`, trailing slash unchanged).
- [x] Main navigation and internal links on the public site point to the new English section paths.
- [x] Sitemap lists the new English section paths (not the old transliteration ones).
- [x] Opening a new section URL (e.g. `/sell-with-us/`, `/en/properties/`) shows the correct page in both locales.
- [x] No requirement to 301/redirect old transliteration section URLs (out of scope by request).

### Path map

| Old segment | New segment |
|---|---|
| `obiavi` | `properties` |
| `prodai-s-nas` | `sell-with-us` |
| `ekip` | `team` |
| `za-nas` | `about` |
| `stati` | `articles` |
| `uslugi` | `services` |
| `dokumenti` | `documents` |
| `investicii` | `investments` |
| `investicii/biznesi` | `investments/businesses` |
| `advokatski-uslugi` | `legal-services` |
| `stranici` | `pages` |
| `kampanii` | `campaigns` |
| `contact` | `contact` (unchanged) |

## Assumptions

- Scope for this task = fixed section path segments only (confirmed).
- No migration / redirects from old transliteration section URLs (confirmed).
- English segment wording follows the map above (assumed).
- Locale scheme unchanged: BG no prefix, EN `/en/`, trailing slash.
- Detail URLs by id → LI-126.

## Out of scope

- 301/redirect map from old section paths
- Changing detail pages from slug to id (LI-126)
- Admin panel routes
- Changing visible page titles/menu labels (only URL segments)

## Handoff

1. `web` subagent: implement, following `web-page` skill (routes, nav, sitemap, SEO helpers, e2e page objects as needed).
2. `test` subagent: verify every acceptance criterion; add/update tests (unit/component; e2e public smoke for key new paths).

## Screenshots and links

- Examples after change: `http://localhost:3000/sell-with-us/`, `http://localhost:3000/properties/`, `http://localhost:3000/en/about/`

## Result

Implemented by `web`, verified by `test` (2026-11-27). All five acceptance criteria pass.

- App Router folders renamed to the English path map (`properties`, `sell-with-us`, `team`, `about`, `articles`, `services`, `documents`, `investments[/businesses]`, `legal-services`, `pages`, `campaigns`); no old folders remain. BG stays unprefixed, EN under `/en/`, trailing slash unchanged.
- Navigation, footer, cards, forms, home, search, SEO metadata, legacy alias redirects (`/oferti` → `/properties/` etc.), brochure/studio listing URLs in the API and e2e page objects use the new paths.
- Sitemap lists the new section paths (incl. `/documents/`) for both locales; no old transliteration segments.
- Old transliteration URLs return 404 (no redirects, as requested). Detail pages still slug-based (LI-126).
- Remaining `prodai-s-nas` strings are the CMS page slug in API data, not a URL segment.

Tests added:
- `apps/web/test/sitemap.test.ts`: sitemap static paths for BG/EN, property URLs under `/properties/`, no old segments, API-down fallback; route folders exist/old ones gone; primary nav hrefs have pages.
- `apps/e2e/src/public/section-urls.spec.ts`: all sections return 200 with the shell in BG and EN, old URL gives 404, header links are English.

Tests updated by `web`: `seo-paths`, `redirects`, `proxy`, `search-form`, `navigation-progress`, API brochure tests.

Run: web 21 files / 44 tests, api 58 / 125, shared 12 / 24, admin 8 / 24 pass; `npm run typecheck`, ESLint and Prettier on new files clean; e2e `public` project 11/11 pass against running dev servers.
