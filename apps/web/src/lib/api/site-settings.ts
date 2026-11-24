import 'server-only';

import type { PublicSiteSettings } from '@luxury-investment/shared';

import { CACHE_TAGS } from './cache';
import { apiGet } from './client';

export async function fetchSiteSettings(): Promise<PublicSiteSettings> {
  const body = await apiGet<{ data: PublicSiteSettings }>('/v1/public/site-settings', {
    // Short TTL so admin edits (phone / social URLs) show up quickly on the public site.
    revalidate: 10,
    tags: [CACHE_TAGS.siteSettings],
  });
  return body.data;
}
