---
name: web-page
description: >-
  Recipe for adding or extending a public page in apps/web (Next.js App Router,
  next-intl, SEO, sitemap). Use when asked to add a public page, section, landing,
  listing view or form on the public site.
---

# Add a public page

Project workflow (tracker, ADRs, commits): `.cursor/skills/luxury-investment-workflow/SKILL.md`.

| Need | Reference |
|---|---|
| Static text page | `apps/web/src/app/[locale]/about/page.tsx` |
| Listing with filters from the URL | `apps/web/src/app/[locale]/properties/page.tsx` |
| Detail page by id | `apps/web/src/app/[locale]/properties/[id]/page.tsx`, `team/` (public detail URLs are `/{section}/{id}/`, LI-126) |
| Server data helper | `apps/web/src/lib/api/team.ts` |

## Checklist

```
- [ ] URL decided (Bulgarian slug, trailing slash; English lives under /en/ automatically)
- [ ] Old-site URL? add a redirect in src/lib/seo/redirects.ts
- [ ] API data exists? If not, do .cursor/skills/api-endpoint/SKILL.md first
- [ ] Data helper in src/lib/api/<resource>.ts (server-only, revalidate + tags)
- [ ] Page in src/app/[locale]/<slug>/page.tsx (+ loading.tsx for slow data)
- [ ] generateMetadata via buildPageMetadata
- [ ] Messages in src/messages/bg.json AND en.json
- [ ] Static path added to src/app/sitemap.ts (dynamic ones generated there too)
- [ ] data-testid on page root and interactive elements
- [ ] Unit/component tests for logic, public e2e for the user flow
- [ ] docs/guides/public-site.md + tracker task updated
```

## 1. Data helper

```ts
// src/lib/api/widgets.ts
import 'server-only';
import type { Locale, PublicWidget } from '@luxury-investment/shared';
import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from './cache';
import { apiGet } from './client';

export async function fetchWidgets(locale: Locale): Promise<PublicWidget[]> {
  const body = await apiGet<{ data: PublicWidget[] }>(`/v1/public/widgets?lang=${locale}`, {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.widgets],
  });
  return body.data;
}
```

Add a new tag to `cache.ts` when the data has its own invalidation.

## 2. Page

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Widgets');
  return buildPageMetadata({ locale: await getLocale(), path: '/widgets', title: t('title'), description: t('lead') });
}

export default async function WidgetsPage() {
  const t = await getTranslations('Widgets');
  const locale = (await getLocale()) as Locale;
  let items: PublicWidget[] = [];
  try {
    items = await fetchWidgets(locale);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error; // API down: render the empty state
  }
  return <main data-testid="widgets-page">{/* ... */}</main>;
}
```

- `notFound()` for a missing slug (404), not an empty page.
- Interactive parts go into small `'use client'` components; keep the page a server component.
- Internal links: `Link` from `@/i18n/navigation`.
- Images: `next/image`; remote hosts must be in `next.config.ts` `images.remotePatterns`.
- Structured data where it helps SEO: `src/lib/seo/json-ld.ts`.

## 3. Tests

- Logic and client components: `apps/web/test/<name>.test.ts(x)` with `// @vitest-environment jsdom`, mock `next-intl` and `@/i18n/navigation` (pattern: `test/cookie-consent-banner.component.test.tsx`).
- User flow: page object in `apps/e2e/src/pages/<name>.elements.ts` + `.page.ts`, spec in `apps/e2e/src/public/` (see `.cursor/skills/e2e-test/SKILL.md`).

## 4. Verify

```bash
npm run typecheck -w @luxury-investment/web   # also regenerates route types
npm test -w @luxury-investment/web
E2E_REUSE_SERVER=1 npm run test:e2e -- src/public
```
