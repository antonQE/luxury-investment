import type {
  Locale,
  PublicArticle,
  PublicArticleListItem,
  PublicPage,
} from '@luxury-investment/shared';
import { pageKindSchema } from '@luxury-investment/shared';
import { and, asc, desc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { articles, pages, translations } from '../../../infrastructure/db/schema.ts';

async function loadFields(
  db: Database,
  entityType: string,
  ids: string[],
  fields: string[],
  locale: Locale,
): Promise<Map<string, Record<string, string>>> {
  const map = new Map<string, Record<string, string>>();
  for (const id of ids) map.set(id, {});
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        inArray(translations.entityId, ids),
        eq(translations.locale, locale),
        inArray(translations.field, fields),
      ),
    );
  for (const row of rows) {
    const current = map.get(row.entityId) ?? {};
    current[row.field] = row.value;
    map.set(row.entityId, current);
  }
  return map;
}

export class ContentPublicService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listArticles(locale: Locale): Promise<PublicArticleListItem[]> {
    const rows = await this.#db
      .select()
      .from(articles)
      .where(and(eq(articles.status, 'published'), isNull(articles.archivedAt)))
      .orderBy(desc(articles.publishedAt), asc(articles.sortOrder), asc(articles.slug));
    const labels = await loadFields(
      this.#db,
      'article',
      rows.map((row) => row.id),
      ['title', 'excerpt'],
      locale,
    );
    return rows.map((row) => {
      const t = labels.get(row.id) ?? {};
      return {
        id: row.id,
        slug: row.slug,
        title: t.title ?? '',
        excerpt: t.excerpt ?? '',
        coverUrl: row.coverUrl,
        authorName: row.authorName,
        publishedAt: row.publishedAt?.toISOString() ?? null,
      };
    });
  }

  async getArticle(locale: Locale, slug: string): Promise<PublicArticle> {
    const [row] = await this.#db
      .select()
      .from(articles)
      .where(
        and(eq(articles.slug, slug), eq(articles.status, 'published'), isNull(articles.archivedAt)),
      )
      .limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND');
    const labels = await loadFields(
      this.#db,
      'article',
      [row.id],
      ['title', 'excerpt', 'body'],
      locale,
    );
    const t = labels.get(row.id) ?? {};
    return {
      id: row.id,
      slug: row.slug,
      title: t.title ?? '',
      excerpt: t.excerpt ?? '',
      body: t.body ?? '',
      coverUrl: row.coverUrl,
      authorName: row.authorName,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    };
  }

  async getPage(locale: Locale, slug: string): Promise<PublicPage> {
    const [row] = await this.#db
      .select()
      .from(pages)
      .where(and(eq(pages.slug, slug), eq(pages.status, 'published'), isNull(pages.archivedAt)))
      .limit(1);
    if (row === undefined) throw new AppError('NOT_FOUND');
    const labels = await loadFields(this.#db, 'page', [row.id], ['title', 'body'], locale);
    const t = labels.get(row.id) ?? {};
    return {
      id: row.id,
      slug: row.slug,
      kind: pageKindSchema.parse(row.kind),
      title: t.title ?? '',
      body: t.body ?? '',
      heroUrl: row.heroUrl,
      publishedAt: row.publishedAt?.toISOString() ?? null,
    };
  }
}
