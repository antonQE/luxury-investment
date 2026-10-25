import type { Database } from '../client.ts';
import { locationsSeed } from './locations.ts';
import { propertiesSeed } from './properties.ts';
import { usersSeed } from './users.ts';

export interface SeedModule {
  name: string;
  /** Must be idempotent: running it twice leaves the same data. */
  run: (db: Database) => Promise<void>;
}

/** Seed modules in the order they run. Reference data first, then content that points to it. */
export const SEED_MODULES: SeedModule[] = [usersSeed, locationsSeed, propertiesSeed];
