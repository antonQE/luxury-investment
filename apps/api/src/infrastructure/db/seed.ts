import { connectDatabase } from './client.ts';
import type { SeedModule } from './seeds/index.ts';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]']);

/** Seeds contain fictional data and must never reach a shared or production database. */
export function assertSeedAllowed(nodeEnv: string, databaseUrl: string): void {
  if (nodeEnv !== 'development' && nodeEnv !== 'test') {
    throw new Error(`Refusing to seed: NODE_ENV is "${nodeEnv}", expected development or test.`);
  }
  const host = new URL(databaseUrl).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(`Refusing to seed: database host "${host}" is not local.`);
  }
}

export async function runSeeds(
  databaseUrl: string,
  modules: SeedModule[],
  log: (message: string) => void = () => undefined,
): Promise<void> {
  const connection = connectDatabase(databaseUrl);
  try {
    for (const module of modules) {
      log(`seeding ${module.name}`);
      await module.run(connection.db);
    }
  } finally {
    await connection.close();
  }
}
