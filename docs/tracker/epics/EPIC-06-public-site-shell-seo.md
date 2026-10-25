# EPIC-06: Public site shell, design system and SEO foundation

- Status: Backlog
- Priority: P1
- Source: 01 §3, §6, §7; 06 SEO-001; 09 LANG-001; 11 A-01, A-03, A-05, F-01; FLOW-005

## Goal

The public site has its design tokens, layout, navigation, footer and language switcher, and every page type gets correct metadata, canonical, hreflang, Open Graph tags, sitemap and robots; slug and legacy redirects answer with HTTP 301.

## Scope

- In: design direction proposed by us and approved by the product owner before pages are built (no external designer; references: savoirproperties.com, imotireplace.bg, luxuryinvestment.framer.ai, the original logo); Tailwind design tokens from that direction; headless primitives choice; header, navigation (all sections from 01 §3, including Investments → Businesses and Legal services), footer; BG/EN switch that keeps the current page when a translation exists; metadata helpers; sitemap and robots; legacy and slug redirects in `proxy.ts` with explicit 301 (current site URL map); JSON-LD helpers; performance budget; error and not-found pages.
- Out: home page content and search (EPIC-07); content pages (EPIC-12).

## Tasks

Decomposed when the epic starts. First task: design direction (moodboard, typography, colors, key page wireframes) for approval.

## Notes

Release 1. Current site URL scheme and redirects: [02-current-site.analysis.md](../../requirements/02-current-site.analysis.md#url-patterns-must-be-preserved-or-redirected-with-301).
