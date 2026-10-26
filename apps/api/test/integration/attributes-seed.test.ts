import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { attributeDefinitions, attributeOptions } from '../../src/infrastructure/db/schema.ts';
import { attributesSeed } from '../../src/infrastructure/db/seeds/attributes.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('attributes seed', () => {
  it('is idempotent and creates select options', async () => {
    await attributesSeed.run(connection.db);
    await attributesSeed.run(connection.db);

    const totals = await connection.db.select({ total: count() }).from(attributeDefinitions);
    expect(totals[0]?.total).toBe(5);

    const heating = await connection.db
      .select()
      .from(attributeDefinitions)
      .where(eq(attributeDefinitions.key, 'heating'))
      .limit(1);
    const heatingId = heating[0]?.id;
    expect(heatingId).toBeDefined();
    if (heatingId === undefined) throw new Error('expected heating');

    const options = await connection.db
      .select()
      .from(attributeOptions)
      .where(eq(attributeOptions.definitionId, heatingId));
    expect(options).toHaveLength(4);
  });
});
