# 0003: Tailwind CSS for the public site, Chakra UI v3 for the admin panel

- Status: Accepted
- Date: 2026-10-25
- Related: [requirements analysis R9](../requirements/01-luxury-investment-spec.analysis.md#r9-ui-library-on-the-public-site), [ADR-0001](0001-public-web-nextjs-admin-vite.md), 01 §7

## Context

The public site must be fast (premium photo-heavy pages, mobile first, Core Web Vitals matter for SEO) and is server-rendered with Next.js App Router. Runtime CSS-in-JS (Chakra UI / Emotion, used in the reference projects) forces most components to be client components and adds JavaScript and style-injection cost.

The admin panel is for internal use only. Speed of building it matters more than visual uniqueness or bundle size, and Fantasy_Web_Admin already has reusable Chakra building blocks.

## Options considered

1. Chakra UI v3 in both apps. One system, but runtime cost on the public site.
2. Chakra in admin, **Panda CSS** on web. Zero runtime with Chakra-like tokens; less familiar.
3. Chakra in admin, **Tailwind CSS** on web. Zero runtime, works with server components, preferred by the team.
4. Tailwind in both apps. One styling approach, but admin loses the ready-made Chakra components and the Fantasy_Web_Admin blocks.

## Decision

- `apps/web`: **Tailwind CSS** (v4). No runtime CSS-in-JS. Server components by default; client components only for interactive parts (gallery, filters, forms, share, map).
- `apps/admin`: **Chakra UI v3**, reusing Fantasy_Web_Admin patterns (`ListPageLayout`, `ListPageTable`, `Pagination`, `RowActionMenu`, `ConfirmModal`, semantic tokens).

## Consequences

- Web design tokens (colors, typography, spacing, radii) live in the Tailwind theme as CSS variables, so the approved design can be applied in one place.
- Interactive web components needing accessibility (dialog, menu, select, gallery lightbox) use a headless primitives library instead of hand-rolled ARIA; chosen in the public-site epic.
- Web and admin do not share UI components; they share only types, schemas and constants through workspace packages.
- The public-site epic defines a performance budget (e.g. Lighthouse mobile performance and LCP targets) that is checked before release.
