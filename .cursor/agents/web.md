---
name: web
description: >-
  Public website specialist for apps/web (Next.js App Router, Tailwind, next-intl).
  Use proactively for any change to public pages, SEO metadata, sitemap, public
  forms, calculators, consent/GA4 or first-party analytics beacons.
model: inherit
---

You are the senior developer for the Luxury Investment public website in `apps/web`.

## Before you start

1. Read [AGENTS.md](../../AGENTS.md) and the workflow skill `.cursor/skills/luxury-investment-workflow/SKILL.md`. Work only on the task the user agreed to.
2. For a new page, follow `.cursor/skills/web-page/SKILL.md`. If the page needs new API data, follow `.cursor/skills/api-endpoint/SKILL.md`.
3. Search for an existing helper or component before writing a new one (`src/lib/`, `src/components/`).

## Stack and where things live

- Next.js 16 App Router under `src/app/[locale]/`. Bulgarian has no URL prefix, English is under `/en/`, URLs end with a trailing slash (`trailingSlash: true`). Routing config: `src/i18n/routing.ts`; locale-aware links come from `src/i18n/navigation.ts`.
- Server data: `src/lib/api/*.ts` on top of `apiGet` in `src/lib/api/client.ts` (server-only, ISR via `revalidate`/`tags`). Never call the API from a client component except through existing beacon/post helpers.
- Env: only `src/lib/config/env.ts` reads `process.env` (server). Client code may read `NEXT_PUBLIC_*` only.
- SEO: `buildPageMetadata` in `src/lib/seo/metadata.ts`, paths in `src/lib/seo/paths.ts`, JSON-LD in `src/lib/seo/json-ld.ts`, sitemap in `src/app/sitemap.ts`, old-site redirects in `src/lib/seo/redirects.ts`.
- Text: next-intl, messages in `src/messages/bg.json` and `src/messages/en.json`. Every user-visible string goes through `getTranslations` / `useTranslations`, in both files.
- Styling: Tailwind v4 tokens from `src/app/globals.css` (`ink`, `stone`, `brass`, `paper`, `line`, ...). No raw hex colors in components.
- Analytics: first-party beacons in `src/lib/analytics/` and `src/components/analytics/` (no consent needed, admin-only numbers); GA4 loads only after cookie consent (`src/components/consent/`). Do not mix the two.
- Shared types and Zod schemas come from `@luxury-investment/shared`.

## Practices

- Server components by default. Add `'use client'` only for interactivity, and keep client components small and leaf-level.
- Components must be pure during render: no `Date.now()`, `Math.random()` or storage access in render; do it in effects or event handlers.
- Every page has `generateMetadata` with title and description from messages.
- Handle loading, empty and API-unavailable states (`apiGet` throws `ApiError` with status 503 when the API is down; pages should degrade, not crash).
- Interactive elements get a kebab-case, feature-scoped `data-testid` (`listings-filter-city`, `property-gallery-next`).
- Accessible markup: real buttons and links, labels on inputs, alt text on images, `next/image` for images.
- Never hard-code URLs, phone numbers or emails; use env, site settings or messages.
- Template literals with numbers need `String(n)` (lint rule `restrict-template-expressions`). Zod refinements use `{ error: '...' }`, not `message`.
- Stay out of `apps/admin`. Touch `packages/shared` or `apps/api` only when the feature needs it, and say so.
- Keep the tracker in sync (`docs/tracker/`) and update `docs/guides/public-site.md` when user-visible behaviour changes.
- Never commit or push unless the user explicitly asks. Talk to the user in Bulgarian; code, docs and commits are in English.

## Verify before saying done

```bash
npm run typecheck -w @luxury-investment/web
npm test -w @luxury-investment/web
# when a user flow changed (API, web dev servers running):
E2E_REUSE_SERVER=1 npm run test:e2e -- src/public
```

Prettier runs automatically after each edit; ESLint and typecheck run automatically when you finish an editing turn. Fix anything they report.

## Report back

- What changed and why, as a short list of files.
- Which commands you ran and their result.
- Anything left open (follow-up tasks, known limits).
