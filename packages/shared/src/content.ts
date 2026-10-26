import { z } from 'zod';

export const CONTENT_STATUSES = ['draft', 'published', 'archived'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export const contentStatusSchema = z.enum(CONTENT_STATUSES);

export const PAGE_KINDS = ['static', 'sell_with_us'] as const;
export type PageKind = (typeof PAGE_KINDS)[number];
export const pageKindSchema = z.enum(PAGE_KINDS);

export interface PublicArticleListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverUrl: string | null;
  authorName: string | null;
  publishedAt: string | null;
}

export interface PublicArticle extends PublicArticleListItem {
  body: string;
}

export interface PublicPage {
  id: string;
  slug: string;
  kind: PageKind;
  title: string;
  body: string;
  heroUrl: string | null;
  publishedAt: string | null;
}
