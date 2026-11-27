# LI-126: Public detail URLs by English section + id

- Epic: EPIC-06
- Status: Review
- Priority: P2
- Size: L
- Area: web, api, e2e
- Depends on: LI-125
- Source: [05-english-section-urls.md](../../requirements/05-english-section-urls.md) (change request, product owner, 2026-11-27)

## Description

Visitors should open every public detail page via an English section path plus the record’s id, not a transliterated slug—e.g. `/properties/{id}/` instead of `/obiavi/{slug}/`. Same pattern for articles, team members, CMS pages and campaigns. No redirects from old slug URLs. Public APIs must support fetch-by-id where they currently only resolve by slug.

## Plain-language summary (BG)

Конкретна обява, статия, човек от екипа, CMS страница или кампания се отваря с английски раздел + ID, напр. `/properties/…/`, `/articles/…/`, `/team/…/`, `/pages/…/`, `/campaigns/…/`. Старите адреси със slug на шлюкавица не се пренасочват. Включително privacy/terms минават през `/pages/{id}/`.

## Acceptance criteria

- [x] Property detail is reachable at `/properties/{id}/` (and `/en/properties/{id}/`) and shows the correct listing.
- [x] Article detail at `/articles/{id}/` (and `/en/…`).
- [x] Team member at `/team/{id}/` (and `/en/…`).
- [x] CMS page at `/pages/{id}/` (and `/en/…`), including privacy and terms.
- [x] Campaign/landing at `/campaigns/{id}/` (and `/en/…`).
- [x] Cards, lists, sitemap, footer and other internal public links use the new id-based URLs.
- [x] Missing/unknown id shows the normal not-found behaviour.
- [x] No requirement to redirect old slug-based detail URLs.

## Assumptions

- Id in the URL = the existing public record id already returned by the API (UUID string), one segment (confirmed direction: English + ids everywhere).
- Privacy and terms also use `/pages/{id}/` (assumed for consistency with “навсякъде”).
- No migration/redirects from old slug URLs (confirmed).
- Depends on LI-125 English section folders being in place first.

## Out of scope

- Renaming or deleting slug fields in admin/CMS (slugs may remain internally)
- 301 from old `/obiavi/{slug}/` (etc.) URLs
- Admin panel routes
- Changing visible titles; only URL shape

## Handoff

1. `web` subagent first owns the public URL change; use `api-endpoint` skill for public get-by-id where needed (or `admin` only if API ownership is clearer—prefer the app agent that needs the data: `web`).
2. `test` subagent: verify every acceptance criterion; add/update API + web/e2e coverage for id-based detail routes.

## Screenshots and links

- Example shapes: `http://localhost:3000/properties/{id}/`, `http://localhost:3000/en/articles/{id}/`

## Result

Verified 2026-11-27 (test agent).

- Detail routes live at `/properties|articles|team|pages|campaigns/[id]` in both locales, backed by new public `GET /v1/public/{properties|articles|pages|team|landings}/by-id/:id` endpoints (properties also `/similar`). Draft content and malformed ids return 404. Slug lookups remain only for calculators, inquiries and legal pages (privacy/terms ids are resolved by slug in the layout and linked via `LegalLink`).
- Cards, article/team lists, home sections, agent links (desktop + mobile bar), footer, cookie banner, landing CTA, sitemap (incl. `/pages/{privacy,terms id}/`) and brochure listing URLs use ids.
- Unknown id: the normal not-found page renders (`data-testid="not-found"`, `noindex`) for all five sections in BG and EN. Like every other route behind `loading.tsx`, the HTTP status of that streamed page is 200, not 404 (pre-existing behaviour, not introduced here).
- Old slug detail URLs are not resolved or redirected (a slug in the id position shows not-found).
- Found during verification: on a stale dev bundle `MobileAgentBar` rendered `/team/undefined/`; after restarting the web dev server it renders `/team/{agentId}/` (covered by e2e).
- Tests added: `apps/web/test/detail-links.component.test.tsx` (LegalLink, PropertyCard, MobileAgentBar) and `apps/e2e/src/public/detail-urls.spec.ts` (all five detail sections BG+EN, unknown id, old slug, card/list links, footer privacy, agent link). Existing: `apps/api/test/integration/public-detail-by-id.test.ts`, `apps/web/test/sitemap.test.ts`, `apps/e2e/src/public/property.spec.ts`.
- Runs: admin 24, api 131 (coverage lines 84.5%, branches 61.1%), web 50, shared 24 unit tests pass; typecheck, eslint and prettier clean; public e2e 20/20 with reused dev servers.
- Gap: the agent-link e2e skips when no published listing has a public agent (the demo seed has none; it runs on the imported dataset).
