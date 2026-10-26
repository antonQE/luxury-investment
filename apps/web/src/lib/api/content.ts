import 'server-only';

import type {
  Locale,
  PublicArticle,
  PublicArticleListItem,
  PublicPage,
} from '@luxury-investment/shared';

import { apiGet } from './client';

function queryString(lang: Locale): string {
  return `?lang=${lang}`;
}

export async function fetchArticles(locale: Locale): Promise<PublicArticleListItem[]> {
  const body = await apiGet<{ data: PublicArticleListItem[] }>(
    `/v1/public/articles${queryString(locale)}`,
    { revalidate: false },
  );
  return body.data;
}

export async function fetchArticle(locale: Locale, slug: string): Promise<PublicArticle> {
  const body = await apiGet<{ data: PublicArticle }>(
    `/v1/public/articles/${encodeURIComponent(slug)}${queryString(locale)}`,
    { revalidate: false },
  );
  return body.data;
}

export async function fetchPage(locale: Locale, slug: string): Promise<PublicPage> {
  const body = await apiGet<{ data: PublicPage }>(
    `/v1/public/pages/${encodeURIComponent(slug)}${queryString(locale)}`,
    { revalidate: false },
  );
  return body.data;
}
