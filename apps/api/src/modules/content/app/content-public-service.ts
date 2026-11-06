import type {
  Locale,
  PublicArticle,
  PublicArticleListItem,
  PublicPage,
} from '@luxury-investment/shared';
import { pageKindSchema } from '@luxury-investment/shared';
import { and, asc, desc, eq, inArray, isNotNull, isNull, lte } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { articles, pages, translations } from '../../../infrastructure/db/schema.ts';

/** Published and due (LI-094): status published, not archived, publishedAt set and <= now. */
function publiclyVisibleNow(table: typeof articles | typeof pages) {
  const now = new Date();
  return and(
    eq(table.status, 'published'),
    isNull(table.archivedAt),
    isNotNull(table.publishedAt),
    lte(table.publishedAt, now),
  );
}

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
      .where(publiclyVisibleNow(articles))
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
      .where(and(eq(articles.slug, slug), publiclyVisibleNow(articles)))
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
      .where(and(eq(pages.slug, slug), publiclyVisibleNow(pages)))
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
