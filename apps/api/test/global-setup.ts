import { runMigrations } from '../src/infrastructure/db/migrate.ts';
import { testDatabaseUrl } from './test-env.ts';

export default async function setup(): Promise<void> {
  try {
    await runMigrations(testDatabaseUrl());
  } catch (error) {
    throw new Error('Could not migrate the test database. Is PostgreSQL running (npm run db:up)?', {
      cause: error,
    });
  }
}
