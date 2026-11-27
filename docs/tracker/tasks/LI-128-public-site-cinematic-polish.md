# LI-128: Public site cinematic boutique polish (draft)

- Epic: EPIC-06
- Status: Review
- Priority: P2
- Size: L
- Area: web
- Depends on: none
- Source: [07-public-site-cinematic-polish.md](../../requirements/07-public-site-cinematic-polish.md) (change request, product owner, 2026-11-27)

## Description

The public site feels flat and not “luxury / boutique agency”. Implement a discretionary visual draft across the whole public site: richer atmosphere, cinematic but restrained motion and presentation. The product owner will review the live draft and approve or request changes. Do **not** change the main colour palette (Gallery Stone). Do **not** run the test-agent handoff until the product owner explicitly approves the draft.

## Plain-language summary (BG)

Целият публичен сайт получава драфт визуален polish — по-бутиков и по-кинематографичен вид, без прекаляване и без смяна на основните цветове. Промените са по усмотрение на изпълнителя в рамките на Gallery Stone. След като ги видите на живо, одобрявате или искате корекции. Тестове чакат вашето одобрение.

## Acceptance criteria

- [x] Whole public site shows a noticeably more boutique / cinematic presence than before (home, listings, property detail, content/team/about/contact and other public pages, plus header/footer), without looking gaudy or noisy.
- [x] Main brand colours / Gallery Stone palette tokens stay the same (no new primary palette).
- [x] Motion and effects feel cinematic but restrained; respect `prefers-reduced-motion`.
- [x] Brand remains a strong first-viewport signal on the home hero; no badge/sticker clutter on hero media.
- [x] Draft is reviewable live on localhost for PO approval before any test-agent handoff.
- [x] Admin panel appearance is unchanged.

## Assumptions

- Scope = entire public site in one draft pass (confirmed).
- Tone = more cinematic than “quiet only”, but not overdone (confirmed).
- Keep main colours (confirmed).
- Visual inventiveness left to the implementer within Gallery Stone and existing design do/don’t list.
- **No `test` subagent until PO says the draft is approved** (confirmed). After approval, run normal test verification as a follow-up step in this task (or a tiny follow-up if needed).

## Out of scope

- New colour system or font family swap
- Admin panel
- Content/copy rewrite (except tiny microcopy if needed for layout)
- New third-party animation libraries unless already in the stack
- Redirects / URL changes

## Handoff

1. `web` subagent: implement discretionary polish across public pages; follow `web-page` skill and `docs/design/public-site-direction.md`. Leave status In Progress and report where to look.
2. **Stop for PO visual review.** Do not call `test` until PO approves.
3. After PO approval: `test` subagent verifies ACs and adds missing tests; then Result + Review.

## Screenshots and links

- Home: `http://localhost:3000/`
- Listings: `http://localhost:3000/properties/`
- Sample detail: open any card from listings
- About / team / contact / sell-with-us as needed

## Draft implementation notes (web, awaiting PO review)

- Shell: header with logo asset, blur/border on scroll, nav hover hairline; footer with logo and brass rule.
- Home: full-bleed hero with one-time photo settle and clearer scrim, search under a hairline; markets as numbered ruled columns; staggered reveals; unified section headers.
- Listings: dark page opener, filter bar overlapping its edge, elevated cards.
- Detail: dark photo stage with cross-fading gallery, key-facts panel overlapping the stage edge, brass-topped facts aside.
- Other pages: shared `PageHero` + ruled lists/steps (about, services, team, articles, contact, sell-with-us, documents, investments, CMS, team and article detail, 404).
- Not run yet by design: e2e / unit suites, `test` agent (waiting for PO approval).

### PO feedback round 1 (draft fixes)

- Home newest cards back to the earlier look (tinted panel, no paper/elevated frame); "Load more" is now a roomy outlined CTA.
- Photo overlays refined: listing badges are small-caps labels with a brass tick over a soft top scrim (no coloured chips); gallery arrows/counter are thin outlined controls; cookie banner is a compact card instead of a full-width strip.
- Header logo crop fixed so the tagline is never clipped (wordmark only on narrow screens).
- Navigation flicker: reveals no longer hide content that is already in view, header background swaps instantly between routes, loaders fade in only after a short delay, page openers no longer fade text in.
- Home hero is now full-viewport (`min-h-svh`), no band under it.

### PO feedback round 2 (ideas 1–4)

- Property detail: larger title, clearer price/facts/gallery rhythm and spacing.
- Team: larger 2-col portraits, quieter hover, brass hairline under names (less list-like).
- Empty states: shared boutique `EmptyState` on listings, similar, team listings, articles, documents, contact.
- Micro-interactions: slower gallery cross-fade; language switcher underline transitions.

### PO follow-up (media placeholders)

- Animated `MediaPlaceholder` when a listing/article/portrait has no photo.
- `RemoteImage` falls back to that placeholder on load error (no broken image icon).
- Demo seed `DEMO-1002` (`demo-kashta-boyana`) ships with empty `imageUrls`; seed upsert refreshes `image_urls`.

## Result

PO approved the draft after feedback rounds 1–2; follow-up media placeholders included. Gallery Stone tokens unchanged; admin untouched.

Verification (2026-11-27, re-run after placeholders):
- `npm run typecheck -w @luxury-investment/web` pass
- web vitest: 25 files / 57 tests pass (incl. `media-placeholder` + `remote-image` component tests)
- public e2e: 20/20 pass (`E2E_REUSE_SERVER=1`); fixed listings open via title link when cover is a placeholder
- Status → Review (developer approves Done)
