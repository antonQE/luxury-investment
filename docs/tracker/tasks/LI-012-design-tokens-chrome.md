# LI-012: Design tokens and public chrome

- Epic: EPIC-06
- Status: Done
- Priority: P1
- Size: M
- Area: web
- Depends on: LI-011

## Description

Apply the approved design direction to Tailwind tokens and upgrade header, footer, language switch and mobile nav to the Release 1 section list (basic links first; Investments submenu can be stubbed).

## Acceptance criteria

- [x] CSS theme tokens match the approved direction; no hard-coded one-off colors in new chrome.
- [x] Header/footer/nav cover Home, Properties, About, Services, Contacts (and placeholders for later sections).
- [x] Language switch keeps the current path when switching BG ↔ EN.
- [x] Works on mobile and desktop; `data-testid` on interactive elements.

## Out of scope

- Full SEO metadata helpers, sitemap, redirects.

## Implementation notes

- Lock Gallery Stone tokens in `globals.css`; chrome uses `void` / `brass` / `stone` / `paper` / `line` (cream/gold kept as aliases).
- Shared nav config for header, mobile and footer: Home, Properties, Investments (stub submenu: Businesses, Legal), About, Services, Contacts.
- Soft enter motion on header and main sections (2–3 fades).
- Language switcher already preserves path via next-intl `usePathname`.

## Result

- Gallery Stone tokens locked; chrome uses void/brass/stone/paper/line.
- Shared `PRIMARY_NAV` with Investments stub (Businesses, Legal services) + placeholder pages.
- Soft fade-in / fade-up motion; reduced-motion respected.
- Language switcher keeps path; smoke-tested BG/EN routes 200.

