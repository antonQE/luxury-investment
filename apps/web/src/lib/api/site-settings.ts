import 'server-only';

import type { PublicSiteSettings } from '@luxury-investment/shared';

import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from './cache';
import { apiGet } from './client';

export async function fetchSiteSettings(): Promise<PublicSiteSettings> {
  const body = await apiGet<{ data: PublicSiteSettings }>('/v1/public/site-settings', {
    revalidate: PUBLIC_REVALIDATE_SECONDS,
    tags: [CACHE_TAGS.siteSettings],
  });
  return body.data;
}
