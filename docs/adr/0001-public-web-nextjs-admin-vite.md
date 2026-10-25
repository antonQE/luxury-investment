# 0001: Next.js for the public site, Vite SPA for the admin panel

- Status: Accepted
- Date: 2026-10-25
- Related: [requirements analysis R1](../requirements/01-luxury-investment-spec.analysis.md#r1-the-public-site-cannot-be-a-client-only-spa-blocker-for-the-reference-stack), SEO-001, MEDIA-003, FLOW-005, MIG-001

## Context

The reference public client (Fantasy_Web) is a client-only Vite SPA on static hosting. The specification makes four things MUST that a client-only SPA cannot deliver:

- Open Graph previews for Facebook, Viber and WhatsApp, whose bots do not run JavaScript;
- real HTTP 301 redirects for changed slugs and migrated URLs;
- indexable property pages with per-page metadata, canonical, hreflang and JSON-LD;
- fast first paint of large property photos.

The admin panel has no SEO needs and Fantasy_Web_Admin is a good reference for it.

## Options considered

1. **Next.js App Router** for the public site. Server rendering, metadata and sitemap APIs, image optimization, caching with on-demand revalidation, largest ecosystem. Cons: the server/client component split adds friction with runtime CSS-in-JS; `permanentRedirect()` sends 308, not 301; self-hosted caching across several instances needs a shared cache.
2. **React Router 7 framework mode.** Same router the team uses, SSR loaders, `meta`/`headers` exports, 301 via `redirect(url, 301)`, no server-component split. Cons: no built-in image optimization or incremental caching; smaller ecosystem for SEO tooling; caching relies on HTTP headers and the CDN only.
3. **Vite SPA + prerender / edge functions** for bots and redirects. Two rendering paths, fragile, bot detection by user agent.
4. **Astro.** Excellent for content, but the interactive search, filters and gallery become islands and the team leaves its React app patterns.

## Decision

- `apps/web`: Next.js (App Router), React 19, TypeScript strict.
- `apps/admin`: Vite + React 19 SPA following the Fantasy_Web_Admin patterns (see `.cursor/skills/luxury-investment-workflow/reference-stack.md`).

## Consequences

- Slug and migration redirects are served from the Next.js proxy (`proxy.ts`, formerly middleware) with an explicit `301` status, backed by the redirect table in the API, with a short-lived cache.
- Pages are server-rendered from the API; publishing, editing or unpublishing a property triggers on-demand revalidation of the affected paths.
- When `web` runs on more than one instance, the Next.js cache needs a shared cache handler or the CDN as the cache layer; decided with hosting.
- The UI library choice must work in server-rendered Next.js (see the UI decision).
- Two frontend build systems in the monorepo; shared code lives in workspace packages, not in either app.

## Review notes

- 2026-10-25 (version check): the current major is Next.js 16, where `middleware.ts` is renamed to `proxy.ts` and runs on the Node.js runtime by default. Redirects are returned from `proxy.ts` with `NextResponse.redirect(url, 301)`; Next.js recommends 308, but the acceptance criteria of the specification (FLOW-005, MIG-001) require 301. The decision is unchanged.
