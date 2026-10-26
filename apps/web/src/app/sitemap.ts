import { type Locale, LOCALES, type PublicProperty } from '@luxury-investment/shared';
import type { MetadataRoute } from 'next';

import { fetchProperties } from '@/lib/api/catalog';
import { serverEnv } from '@/lib/config/env';
import { absoluteUrl } from '@/lib/seo/paths';

const STATIC_PATHS = [
  '/',
  '/obiavi/',
  '/za-nas/',
  '/ekip/',
  '/stati/',
  '/prodai-s-nas/',
  '/uslugi/',
  '/contact/',
  '/investicii/',
  '/investicii/biznesi/',
  '/advokatski-uslugi/',
  '/stranici/privacy/',
  '/stranici/terms/',
] as const;

async function allPublishedProperties(locale: Locale): Promise<PublicProperty[]> {
  const items: PublicProperty[] = [];
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
        changeFrequency: path === '/' || path === '/obiavi/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.7,
      });
    }
  }

  try {
    const properties = await allPublishedProperties('bg');
    for (const property of properties) {
      for (const locale of LOCALES) {
        entries.push({
          url: absoluteUrl(siteUrl, locale, `/obiavi/${property.slug}/`),
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
