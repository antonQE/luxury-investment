import { ROLE_KEYS } from '@luxury-investment/shared';
import { verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { roles, users } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import {
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  usersSeed,
} from '../../src/infrastructure/db/seeds/users.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

beforeEach(async () => {
  await resetDatabase(connection);
});

afterAll(async () => {
  await connection.close();
});

describe('users seed', () => {
  it('creates role templates and a demo main admin', async () => {
    await usersSeed.run(connection.db);

    const seededRoles = await connection.db.select().from(roles);
    expect(seededRoles.map((row) => row.key).sort()).toEqual([...ROLE_KEYS].sort());

    const [admin] = await connection.db
      .select()
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);
    expect(admin).toBeDefined();
    if (admin === undefined) throw new Error('expected demo admin');
    expect(admin.isActive).toBe(true);
    await expect(verify(admin.passwordHash, DEMO_ADMIN_PASSWORD)).resolves.toBe(true);
  });

  it('is idempotent with the full seed pipeline', async () => {
    for (const module of SEED_MODULES) {
      await module.run(connection.db);
    }
    for (const module of SEED_MODULES) {
      await module.run(connection.db);
    }

    const admins = await connection.db
      .select()
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL));
    expect(admins).toHaveLength(1);
  });
});
