import type {
  Locale,
  PublicArticle,
  PublicArticleListItem,
  PublicPage,
} from '@luxury-investment/shared';
import { isRecordId, pageKindSchema } from '@luxury-investment/shared';
import { and, asc, desc, eq, inArray, isNotNull, isNull, lte, type SQL } from 'drizzle-orm';

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
    return this.#loadArticle(locale, eq(articles.slug, slug));
  }

  /** Public detail by record id (`/articles/{id}/`). Malformed ids are "not found". */
  async getArticleById(locale: Locale, id: string): Promise<PublicArticle> {
    if (!isRecordId(id)) throw new AppError('NOT_FOUND');
    return this.#loadArticle(locale, eq(articles.id, id));
  }

  async getPage(locale: Locale, slug: string): Promise<PublicPage> {
    return this.#loadPage(locale, eq(pages.slug, slug));
  }

  /** Public detail by record id (`/pages/{id}/`). Malformed ids are "not found". */
  async getPageById(locale: Locale, id: string): Promise<PublicPage> {
    if (!isRecordId(id)) throw new AppError('NOT_FOUND');
    return this.#loadPage(locale, eq(pages.id, id));
  }

  async #loadArticle(locale: Locale, match: SQL | undefined): Promise<PublicArticle> {
    const [row] = await this.#db
      .select()
      .from(articles)
      .where(and(match, publiclyVisibleNow(articles)))
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

  async #loadPage(locale: Locale, match: SQL | undefined): Promise<PublicPage> {
    const [row] = await this.#db
      .select()
      .from(pages)
      .where(and(match, publiclyVisibleNow(pages)))
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
