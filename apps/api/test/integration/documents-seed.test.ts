import { SELLER_HANDBOOK_SLUG } from '@luxury-investment/shared';
import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { documents, documentVersions, translations } from '../../src/infrastructure/db/schema.ts';
import { documentsSeed } from '../../src/infrastructure/db/seeds/documents.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('documents seed', () => {
  it('is idempotent and sets current handbook version', async () => {
    await documentsSeed.run(connection.db);
    await documentsSeed.run(connection.db);

    expect((await connection.db.select({ total: count() }).from(documents))[0]?.total).toBe(1);
    expect((await connection.db.select({ total: count() }).from(documentVersions))[0]?.total).toBe(
      1,
    );

    const [doc] = await connection.db
      .select()
      .from(documents)
      .where(eq(documents.slug, SELLER_HANDBOOK_SLUG))
      .limit(1);
    expect(doc?.kind).toBe('seller_handbook');
    expect(doc?.currentVersionId).toBeTruthy();

    if (doc === undefined) return;
    const titles = await connection.db
      .select()
      .from(translations)
      .where(eq(translations.entityId, doc.id));
    expect(titles.some((row) => row.field === 'title' && row.locale === 'en')).toBe(true);
  });
});
