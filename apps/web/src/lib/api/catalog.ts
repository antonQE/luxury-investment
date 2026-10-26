import 'server-only';

import type {
  Locale,
  Paginated,
  PublicProperty,
  PublicPropertyListItem,
} from '@luxury-investment/shared';
import { propertyListQuerySchema } from '@luxury-investment/shared';

import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from './cache';
import { apiGet } from './client';

export interface CatalogFilters {
  transactionType?: string;
  propertyType?: string;
  market?: string;
  city?: string;
  district?: string;
  bedroomsMin?: string;
  priceMin?: string;
  priceMax?: string;
  areaMin?: string;
  areaMax?: string;
  q?: string;
  offset?: string;
  limit?: string;
}

export function parseCatalogFilters(raw: CatalogFilters) {
  const parsed = propertyListQuerySchema.safeParse(raw);
  return parsed.success ? parsed.data : propertyListQuerySchema.parse({});
}

function queryString(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === '') continue;
    search.set(key, String(value));
  }
  const encoded = search.toString();
  return encoded === '' ? '' : `?${encoded}`;
}

export async function fetchProperties(
  locale: Locale,
  filters: CatalogFilters = {},
): Promise<Paginated<PublicPropertyListItem>> {
  const query = parseCatalogFilters(filters);
  return apiGet<Paginated<PublicPropertyListItem>>(
    `/v1/public/properties${queryString({ ...query, lang: locale })}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.properties] },
  );
}

export async function fetchProperty(locale: Locale, slug: string): Promise<PublicProperty> {
  const body = await apiGet<{ data: PublicProperty }>(
    `/v1/public/properties/${encodeURIComponent(slug)}${queryString({ lang: locale })}`,
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.properties, CACHE_TAGS.property(slug)],
    },
  );
  return body.data;
}

export async function fetchSimilarProperties(
  locale: Locale,
  slug: string,
): Promise<PublicPropertyListItem[]> {
  const body = await apiGet<{ data: PublicPropertyListItem[] }>(
    `/v1/public/properties/${encodeURIComponent(slug)}/similar${queryString({ lang: locale })}`,
    {
      revalidate: PUBLIC_REVALIDATE_SECONDS,
      tags: [CACHE_TAGS.properties, CACHE_TAGS.property(slug)],
    },
  );
  return body.data;
}
