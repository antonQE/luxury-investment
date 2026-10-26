import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { contactRoles, contacts } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  await connection.close();
});

describe('contacts seed', () => {
  it('loads demo contacts with roles', async () => {
    const people = await connection.db.select().from(contacts);
    expect(people.length).toBeGreaterThanOrEqual(3);
    const roles = await connection.db.select().from(contactRoles);
    expect(roles.length).toBeGreaterThanOrEqual(4);
    const ivanov = people.find((row) => row.email === 'client.ivanov@example.com');
    expect(ivanov?.kind).toBe('person');
    const ivanovRoles = roles.filter((row) => row.contactId === ivanov?.id).map((r) => r.role);
    expect(ivanovRoles.sort()).toEqual(['buyer', 'investor']);
  });

  it('is idempotent', async () => {
    const before = await connection.db.select().from(contacts);
    for (const module of SEED_MODULES) {
      await module.run(connection.db);
    }
    const after = await connection.db.select().from(contacts);
    expect(after).toHaveLength(before.length);
  });
});
