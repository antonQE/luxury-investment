import { existsSync } from 'node:fs';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const ROOT_ENV_FILE = fileURLToPath(new URL('../../../.env', import.meta.url));

/** The integration test database (separate from luxury_dev; see docker-compose.yml). */
export function testDatabaseUrl(): string {
  if (process.env.TEST_DATABASE_URL === undefined && existsSync(ROOT_ENV_FILE)) {
    process.loadEnvFile(ROOT_ENV_FILE);
  }
  const url = process.env.TEST_DATABASE_URL;
  if (url === undefined) {
    throw new Error(
      'TEST_DATABASE_URL is not set. Copy .env.example to .env and run npm run db:up.',
    );
  }
  return url;
}
