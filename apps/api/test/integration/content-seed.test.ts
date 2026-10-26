import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { articles, pages, translations } from '../../src/infrastructure/db/schema.ts';
import { contentSeed } from '../../src/infrastructure/db/seeds/content.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('content seed', () => {
  it('is idempotent and writes article/page translations', async () => {
    await contentSeed.run(connection.db);
    await contentSeed.run(connection.db);

    expect((await connection.db.select({ total: count() }).from(articles))[0]?.total).toBe(3);
    expect((await connection.db.select({ total: count() }).from(pages))[0]?.total).toBe(3);

    const [article] = await connection.db
      .select()
      .from(articles)
      .where(eq(articles.slug, 'demo-sofia-market-overview'))
      .limit(1);
    expect(article?.status).toBe('published');
    if (article === undefined) return;

    const fields = await connection.db
      .select()
      .from(translations)
      .where(eq(translations.entityId, article.id));
    expect(fields.some((row) => row.field === 'title' && row.locale === 'en')).toBe(true);

    const [sell] = await connection.db
      .select()
      .from(pages)
      .where(eq(pages.slug, 'prodai-s-nas'))
      .limit(1);
    expect(sell?.kind).toBe('sell_with_us');
  });
});
