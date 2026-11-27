# LI-129: Public site mobile e2e — main flows per page

- Epic: EPIC-19
- Status: Review
- Priority: P2
- Size: L
- Area: e2e, web
- Depends on: none
- Source: [08-public-mobile-e2e.md](../../requirements/08-public-mobile-e2e.md) (change request, product owner, 2026-11-27)

## Description

Prove the public website works on a phone viewport: not only desktop Chrome. Add Playwright mobile coverage for the **main happy path on every major public page/section**, including mobile-only chrome (hamburger nav, sticky agent bar). Admin stays desktop-only.

## Plain-language summary (BG)

На публичния сайт добавяме автоматични тестове в мобилен изглед. За всяка основна страница проверяваме главния сценарий (меню, търсене/филтри, отваряне на обява, долна лента за обаждане, ключови форми и секции). Админ панелът не влиза. Целта е да сме сигурни, че сайтът работи и на телефон.

## Acceptance criteria

- [x] Playwright has a dedicated **public mobile** project (phone-class Chromium device, e.g. iPhone 13 / Pixel-like).
- [x] On mobile, **cookie consent** can be accepted when shown (same pattern as desktop).
- [x] On mobile, **home** loads; visitor can open the hamburger menu and reach at least one main section.
- [x] On mobile, **listings** (`/properties/`): filter/search happy path updates results/URL; opening a listing card reaches the property page.
- [x] On mobile, **property detail**: page shell is visible; **MobileAgentBar** (call / messaging actions) is visible and usable; inquiry form happy path still works (or is covered if already elsewhere — must not regress).
- [x] On mobile, **sell-with-us** consultation form happy path works.
- [x] On mobile, **empty search** shows the empty state (and search-request path if present).
- [x] On mobile, **EN locale** shell loads for home (or equivalent locale smoke).
- [x] On mobile, **section pages** open for each major fixed section (properties, sell-with-us, legal-services, documents, investments, services, articles, team, about, contact — and nested investments/businesses if it has a distinct page).
- [x] On mobile, **id-based detail** happy paths work for property, article, team member, CMS page, campaign (open at `/{section}/{id}/`).
- [x] Desktop public project remains green; mobile does not replace desktop.
- [x] Admin e2e project is unchanged (no mobile admin project required).

## Assumptions

- Public site only (confirmed).
- “Every page, all main flows” = one primary happy path per major public surface listed above, not exhaustive edge cases (confirmed direction).
- Phone viewport via Playwright device profile; Chromium is enough (no separate Safari project unless already required).
- Reuse existing page objects / testids; add missing `data-testid`s in `apps/web` only when a flow cannot be located reliably.
- Follow `.cursor/skills/e2e-test/SKILL.md`.

## Out of scope

- Admin panel mobile e2e
- Visual regression / screenshot pixel diffs
- Exhaustive matrix of every filter combination
- Real device farm (BrowserStack etc.)

## Handoff

1. `test` subagent owns implementation (e2e skill); ask `web` only if missing testids or a mobile layout bug blocks a flow.
2. If a real mobile UX bug is found: one fix round with `web`, then re-run mobile e2e.
3. `test` verifies every acceptance criterion and fills Result → Review.

## Screenshots and links

- Public: `http://localhost:3000/` (emulate phone in Playwright)
- Run: `E2E_REUSE_SERVER=1 npm run test:e2e --workspace=@luxury-investment/e2e -- --project=public-mobile` (exact project name as implemented)

## Result

Added Playwright project `public-mobile` (iPhone 13 viewport on Chromium). All existing `public/*.spec.ts` flows run on mobile; plus `mobile-shell.spec.ts` for hamburger nav, investments submenu, and visible MobileAgentBar. Cookie banner raised above the sticky agent bar on small screens. Desktop `public`: 20 passed (4 mobile-only skipped). Mobile: 24 passed. Run: `E2E_REUSE_SERVER=1 npm run test:e2e --workspace=@luxury-investment/e2e -- --project=public-mobile`. Status → Review.
