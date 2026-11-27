import { type Locale, LOCALES, type PublicPropertyListItem } from '@luxury-investment/shared';
import type { MetadataRoute } from 'next';

import { fetchProperties } from '@/lib/api/catalog';
import { fetchLegalPageIds } from '@/lib/api/content';
import { serverEnv } from '@/lib/config/env';
import { absoluteUrl } from '@/lib/seo/paths';

const STATIC_PATHS = [
  '/',
  '/properties/',
  '/about/',
  '/team/',
  '/articles/',
  '/sell-with-us/',
  '/services/',
  '/contact/',
  '/investments/',
  '/investments/businesses/',
  '/legal-services/',
  '/documents/',
] as const;

async function allPublishedProperties(locale: Locale): Promise<PublicPropertyListItem[]> {
  const items: PublicPropertyListItem[] = [];
  let offset = 0;
  const limit = 48;
  for (;;) {
    const page = await fetchProperties(locale, {
      offset: String(offset),
      limit: String(limit),
    });
    items.push(...page.data);
    offset += page.limit;
    if (offset >= page.total || page.data.length === 0) break;
  }
  return items;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = serverEnv().SITE_URL;
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: absoluteUrl(siteUrl, locale, path),
        changeFrequency: path === '/' || path === '/properties/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.7,
      });
    }
  }

  for (const locale of LOCALES) {
    const { privacy, terms } = await fetchLegalPageIds(locale);
    for (const id of [privacy, terms]) {
      if (id === null) continue;
      entries.push({
        url: absoluteUrl(siteUrl, locale, `/pages/${id}/`),
        changeFrequency: 'monthly',
        priority: 0.3,
      });
    }
  }

  try {
    const properties = await allPublishedProperties('bg');
    for (const property of properties) {
      for (const locale of LOCALES) {
        entries.push({
          url: absoluteUrl(siteUrl, locale, `/properties/${property.id}/`),
          lastModified: new Date(property.publishedAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch {
    // Sitemap still lists static pages if the API is down during build/dev.
  }

  return entries;
}
