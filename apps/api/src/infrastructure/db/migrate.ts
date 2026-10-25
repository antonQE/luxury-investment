import { fileURLToPath } from 'node:url';

import { migrate } from 'drizzle-orm/node-postgres/migrator';

import { connectDatabase } from './client.ts';

export const MIGRATIONS_FOLDER = fileURLToPath(new URL('./migrations', import.meta.url));

export async function runMigrations(url: string): Promise<void> {
  const connection = connectDatabase(url);
  try {
    await migrate(connection.db, { migrationsFolder: MIGRATIONS_FOLDER });
  } finally {
    await connection.close();
  }
}
