import 'server-only';

import type {
  Locale,
  PublicArticle,
  PublicArticleListItem,
  PublicLanding,
  PublicPage,
} from '@luxury-investment/shared';

import { CACHE_TAGS, PUBLIC_REVALIDATE_SECONDS } from './cache';
import { apiGet } from './client';

function queryString(lang: Locale): string {
  return `?lang=${lang}`;
}

export async function fetchArticles(locale: Locale): Promise<PublicArticleListItem[]> {
  const body = await apiGet<{ data: PublicArticleListItem[] }>(
    `/v1/public/articles${queryString(locale)}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.content] },
  );
  return body.data;
}

export async function fetchArticle(locale: Locale, id: string): Promise<PublicArticle> {
  const body = await apiGet<{ data: PublicArticle }>(
    `/v1/public/articles/by-id/${encodeURIComponent(id)}${queryString(locale)}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.content] },
  );
  return body.data;
}

export async function fetchPage(locale: Locale, id: string): Promise<PublicPage> {
  const body = await apiGet<{ data: PublicPage }>(
    `/v1/public/pages/by-id/${encodeURIComponent(id)}${queryString(locale)}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.content] },
  );
  return body.data;
}

export async function fetchLanding(locale: Locale, id: string): Promise<PublicLanding> {
  const body = await apiGet<{ data: PublicLanding }>(
    `/v1/public/landings/by-id/${encodeURIComponent(id)}${queryString(locale)}`,
    { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.content] },
  );
  return body.data;
}

export interface LegalPageIds {
  privacy: string | null;
  terms: string | null;
}

async function legalPageId(locale: Locale, slug: 'privacy' | 'terms'): Promise<string | null> {
  try {
    const body = await apiGet<{ data: PublicPage }>(
      `/v1/public/pages/${slug}${queryString(locale)}`,
      { revalidate: PUBLIC_REVALIDATE_SECONDS, tags: [CACHE_TAGS.content] },
    );
    return body.data.id;
  } catch {
    return null;
  }
}

/**
 * Ids of the privacy and terms CMS pages. Their public URLs are `/pages/{id}/`;
 * the API still resolves the well-known slugs, which is the only place a slug is used.
 */
export async function fetchLegalPageIds(locale: Locale): Promise<LegalPageIds> {
  const [privacy, terms] = await Promise.all([
    legalPageId(locale, 'privacy'),
    legalPageId(locale, 'terms'),
  ]);
  return { privacy, terms };
}
