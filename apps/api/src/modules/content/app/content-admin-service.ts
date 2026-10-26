import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { articles, pages, translations } from '../../../infrastructure/db/schema.ts';

async function writePair(
  db: Database,
  entityType: string,
  entityId: string,
  field: string,
  bg: string,
  en: string,
) {
  for (const [locale, value] of [
    ['bg', bg],
    ['en', en],
  ] as const) {
    await db
      .insert(translations)
      .values({ entityType, entityId, locale, field, value })
      .onConflictDoUpdate({
        target: [
          translations.entityType,
          translations.entityId,
          translations.locale,
          translations.field,
        ],
        set: { value },
      });
  }
}

async function loadTitles(
  db: Database,
  entityType: string,
  ids: string[],
): Promise<Map<string, { bg: string; en: string }>> {
  const map = new Map<string, { bg: string; en: string }>();
  for (const id of ids) map.set(id, { bg: '', en: '' });
  if (ids.length === 0) return map;
  const rows = await db
    .select()
    .from(translations)
    .where(
      and(
        eq(translations.entityType, entityType),
        inArray(translations.entityId, ids),
        eq(translations.field, 'title'),
      ),
    );
  for (const row of rows) {
    const current = map.get(row.entityId) ?? { bg: '', en: '' };
    if (row.locale === 'bg') current.bg = row.value;
    if (row.locale === 'en') current.en = row.value;
    map.set(row.entityId, current);
  }
  return map;
}

export class ContentAdminService {
  readonly #db: Database;

  constructor(db: Database) {
    this.#db = db;
  }

  async listArticles() {
    const rows = await this.#db
      .select()
      .from(articles)
      .where(isNull(articles.archivedAt))
      .orderBy(asc(articles.sortOrder), asc(articles.slug));
    const titles = await loadTitles(
      this.#db,
      'article',
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      status: row.status,
      coverUrl: row.coverUrl,
      authorName: row.authorName,
      publishedAt: row.publishedAt,
      sortOrder: row.sortOrder,
      title: titles.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createArticle(input: {
    slug: string;
    titleBg: string;
    titleEn: string;
    excerptBg: string;
    excerptEn: string;
    bodyBg: string;
    bodyEn: string;
    coverUrl?: string | null;
    authorName?: string | null;
    sortOrder?: number;
  }) {
    const [inserted] = await this.#db
      .insert(articles)
      .values({
        slug: input.slug,
        status: 'draft',
        coverUrl: input.coverUrl ?? null,
        authorName: input.authorName ?? null,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writePair(this.#db, 'article', inserted.id, 'title', input.titleBg, input.titleEn);
    await writePair(this.#db, 'article', inserted.id, 'excerpt', input.excerptBg, input.excerptEn);
    await writePair(this.#db, 'article', inserted.id, 'body', input.bodyBg, input.bodyEn);
    return inserted;
  }

  async publishArticle(id: string) {
    const [row] = await this.#db
      .update(articles)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(articles.id, id), isNull(articles.archivedAt)))
      .returning();
    if (row === undefined) throw new AppError('NOT_FOUND');
    return row;
  }

  async archiveArticle(id: string) {
    const [row] = await this.#db
      .update(articles)
      .set({
        status: 'archived',
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(articles.id, id), isNull(articles.archivedAt)))
      .returning();
    if (row === undefined) throw new AppError('NOT_FOUND');
    return row;
  }

  async listPages() {
    const rows = await this.#db
      .select()
      .from(pages)
      .where(isNull(pages.archivedAt))
      .orderBy(asc(pages.sortOrder), asc(pages.slug));
    const titles = await loadTitles(
      this.#db,
      'page',
      rows.map((row) => row.id),
    );
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      kind: row.kind,
      status: row.status,
      heroUrl: row.heroUrl,
      publishedAt: row.publishedAt,
      sortOrder: row.sortOrder,
      title: titles.get(row.id) ?? { bg: '', en: '' },
    }));
  }

  async createPage(input: {
    slug: string;
    kind: string;
    titleBg: string;
    titleEn: string;
    bodyBg: string;
    bodyEn: string;
    heroUrl?: string | null;
    sortOrder?: number;
  }) {
    const [inserted] = await this.#db
      .insert(pages)
      .values({
        slug: input.slug,
        kind: input.kind,
        status: 'draft',
        heroUrl: input.heroUrl ?? null,
        sortOrder: input.sortOrder ?? 0,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    await writePair(this.#db, 'page', inserted.id, 'title', input.titleBg, input.titleEn);
    await writePair(this.#db, 'page', inserted.id, 'body', input.bodyBg, input.bodyEn);
    return inserted;
  }

  async publishPage(id: string) {
    const [row] = await this.#db
      .update(pages)
      .set({
        status: 'published',
        publishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(pages.id, id), isNull(pages.archivedAt)))
      .returning();
    if (row === undefined) throw new AppError('NOT_FOUND');
    return row;
  }

  async archivePage(id: string) {
    const [row] = await this.#db
      .update(pages)
      .set({
        status: 'archived',
        archivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(pages.id, id), isNull(pages.archivedAt)))
      .returning();
    if (row === undefined) throw new AppError('NOT_FOUND');
    return row;
  }
}
