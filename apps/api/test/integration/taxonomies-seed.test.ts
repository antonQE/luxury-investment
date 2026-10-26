import { and, count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { badges, markets, translations } from '../../src/infrastructure/db/schema.ts';
import { taxonomiesSeed } from '../../src/infrastructure/db/seeds/taxonomies.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('taxonomies seed', () => {
  it('is idempotent and stores market translations', async () => {
    await taxonomiesSeed.run(connection.db);
    await taxonomiesSeed.run(connection.db);

    const marketTotals = await connection.db.select({ total: count() }).from(markets);
    expect(marketTotals[0]?.total).toBe(3);

    const sofia = await connection.db
      .select()
      .from(markets)
      .where(eq(markets.key, 'sofia'))
      .limit(1);
    const sofiaId = sofia[0]?.id;
    expect(sofiaId).toBeDefined();
    if (sofiaId === undefined) throw new Error('expected sofia market');

    const names = await connection.db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'market'),
          eq(translations.entityId, sofiaId),
          eq(translations.field, 'name'),
        ),
      );
    expect(names.map((row) => row.locale).sort()).toEqual(['bg', 'en']);

    const badgeTotals = await connection.db.select({ total: count() }).from(badges);
    expect(badgeTotals[0]?.total).toBe(6);
  });
});
