# Public site design direction (LI-011)

Status: **Approved** (product owner, 2026-10-25)  
Date: 2026-10-25  
References: [savoirproperties.com](https://savoirproperties.com/) (atmosphere), [imotireplace.bg](https://imotireplace.bg/) (function), current LI site as content baseline. Logo: wordmark text until the original asset is provided.

## Intent

A quiet boutique agency site: photography first, little chrome, no dashboard feel. Bulgarian and English share one layout. Listings start immediately after the first scroll.

## Visual direction — “Gallery Stone”

| Role | Token | Value | Notes |
|---|---|---|---|
| Page ground | `--color-stone` | `#F2EFE9` | Cool stone, not warm café cream |
| Paper / panels | `--color-paper` | `#FFFcf7` | Cards only where interaction needs a surface |
| Ink | `--color-ink` | `#14161C` | Near-black with a cool cast |
| Soft ink | `--color-ink-soft` | `#4A4F5C` | Body secondary |
| Accent | `--color-brass` | `#A68445` | Thin brass line / links — not loud gold blocks |
| Dark plane | `--color-void` | `#12141A` | Full-bleed heroes and header |
| Hairline | `--color-line` | `#D9D3C8` | Borders |

**Avoid:** purple gradients, glow, pill clusters, multi-layer shadows, emoji, newspaper dense columns, terracotta-on-cream “AI default”, floating badges on hero photos.

## Typography

| Role | Family | Use |
|---|---|---|
| Display | **Source Serif 4** (Cyrillic) | H1/H2, property titles, brand wordmark |
| Body / UI | **Source Sans 3** (Cyrillic) | Nav, forms, facts, footer |

Sizes: hero ~clamp(2.5rem, 5vw, 3.75rem); section titles ~1.75–2.25rem; body 1rem / 1.6. Tracking: uppercase labels +0.15–0.2em in brass or muted ink.

## Layout principles

1. **One composition in the first viewport:** brand, one headline, one line of support, one search row, dark full-bleed ground. No stats strip, no promo chips.
2. **Full-bleed hero only** — image or dark plane edge-to-edge; no inset hero card.
3. **No cards in the hero.** Listing cards are allowed only as the clickable listing unit below the fold.
4. **One job per section:** Markets | Newest | (later) Services.
5. **Motion (later LI-012+):** 2–3 soft fades/slides on enter — not continuous noise.

## Key screens (live prototype)

The running site at `/`, `/obiavi/`, `/obiavi/<slug>/` is the prototype for this direction after the token pass in this task.

| Screen | What to judge |
|---|---|
| Home | Dark hero + search; markets as quiet links; newest grid |
| Listings | Filters as a single bar; photo-led cards; cream ground |
| Property | Wide gallery, facts aside, agent actions — no clutter overlays |

## Do / don’t

- Do: generous whitespace, real listing photos, clear price hierarchy.
- Do: language switch as plain BG / EN text.
- Don’t: badge stickers on the hero; don’t invent stats.
- Don’t: round-full pills for filters; use simple selects and a solid CTA.

## Approval

Approved 2026-10-25. LI-012 locks tokens into chrome and expands the nav.
