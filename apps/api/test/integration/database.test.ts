import { sql } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { assertSeedAllowed } from '../../src/infrastructure/db/seed.ts';
import { connectTestDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();

afterAll(async () => {
  await connection.close();
});

describe('database', () => {
  it('is reachable', async () => {
    await expect(connection.ping()).resolves.toBe(true);
  });

  it('has the extensions from the first migration', async () => {
    const result = await connection.db.execute<{ extname: string }>(
      sql`select extname from pg_extension where extname in ('pg_trgm', 'unaccent') order by extname`,
    );
    expect(result.rows.map((row) => row.extname)).toEqual(['pg_trgm', 'unaccent']);
  });

  it('is reported as up by /health', async () => {
    const app = createApp({
      env: { API_CORS_ORIGINS: [] },
      logger: pino({ level: 'silent' }),
      healthChecks: [{ name: 'database', check: connection.ping }],
    });
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ components: { database: 'up' } });
  });
});

describe('assertSeedAllowed', () => {
  const local = 'postgres://luxury:luxury@localhost:54329/luxury_dev';

  it('allows local development and test databases', () => {
    expect(() => {
      assertSeedAllowed('development', local);
    }).not.toThrow();
    expect(() => {
      assertSeedAllowed('test', 'postgres://u:p@127.0.0.1:5432/x');
    }).not.toThrow();
  });

  it('refuses production and remote hosts', () => {
    expect(() => {
      assertSeedAllowed('production', local);
    }).toThrow(/NODE_ENV/);
    expect(() => {
      assertSeedAllowed('development', 'postgres://u:p@db.example.com:5432/x');
    }).toThrow(/not local/);
  });
});
