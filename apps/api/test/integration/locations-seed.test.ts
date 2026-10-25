import { and, count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { locations, translations } from '../../src/infrastructure/db/schema.ts';
import { locationsSeed } from '../../src/infrastructure/db/seeds/locations.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('locations seed', () => {
  it('is idempotent and stores translations', async () => {
    await locationsSeed.run(connection.db);
    await locationsSeed.run(connection.db);

    const totals = await connection.db.select({ total: count() }).from(locations);
    expect(totals[0]?.total ?? 0).toBeGreaterThanOrEqual(10);

    const sofia = await connection.db
      .select()
      .from(locations)
      .where(and(eq(locations.kind, 'city'), eq(locations.slug, 'sofia')))
      .limit(1);
    expect(sofia[0]).toBeDefined();
    const sofiaId = sofia[0]?.id;
    if (sofiaId === undefined) throw new Error('expected sofia');

    const names = await connection.db
      .select()
      .from(translations)
      .where(
        and(
          eq(translations.entityType, 'location'),
          eq(translations.entityId, sofiaId),
          eq(translations.field, 'name'),
        ),
      );
    expect(names.map((row) => row.locale).sort()).toEqual(['bg', 'en']);
  });
});
