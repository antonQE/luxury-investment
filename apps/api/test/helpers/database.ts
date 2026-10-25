import { sql } from 'drizzle-orm';

import { connectDatabase, type DatabaseConnection } from '../../src/infrastructure/db/client.ts';
import { testDatabaseUrl } from '../test-env.ts';

export function connectTestDatabase(): DatabaseConnection {
  return connectDatabase(testDatabaseUrl());
}

/** Empties every table in the public schema so each test starts from a known state. */
export async function resetDatabase({ db }: DatabaseConnection): Promise<void> {
  const result = await db.execute<{ tablename: string }>(
    sql`select tablename from pg_tables where schemaname = 'public'`,
  );
  if (result.rows.length === 0) return;
  const tables = result.rows.map(({ tablename }) => `"public"."${tablename}"`).join(', ');
  await db.execute(sql.raw(`truncate ${tables} restart identity cascade`));
}
