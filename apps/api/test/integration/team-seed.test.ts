import { count, eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import {
  offices,
  partners,
  teamMembers,
  translations,
} from '../../src/infrastructure/db/schema.ts';
import { teamSeed } from '../../src/infrastructure/db/seeds/team.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('team seed', () => {
  it('is idempotent and writes translations', async () => {
    await teamSeed.run(connection.db);
    await teamSeed.run(connection.db);

    expect((await connection.db.select({ total: count() }).from(teamMembers))[0]?.total).toBe(3);
    expect((await connection.db.select({ total: count() }).from(offices))[0]?.total).toBe(2);
    expect((await connection.db.select({ total: count() }).from(partners))[0]?.total).toBe(2);

    const [member] = await connection.db
      .select()
      .from(teamMembers)
      .where(eq(teamMembers.slug, 'demo-ivanova'))
      .limit(1);
    expect(member).toBeDefined();
    if (member === undefined) return;

    const names = await connection.db
      .select()
      .from(translations)
      .where(eq(translations.entityId, member.id));
    expect(names.some((row) => row.field === 'name' && row.locale === 'en')).toBe(true);
  });
});
