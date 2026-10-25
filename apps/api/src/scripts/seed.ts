import process from 'node:process';

import { parseEnv } from '../config/env.ts';
import { assertSeedAllowed, runSeeds } from '../infrastructure/db/seed.ts';
import { SEED_MODULES } from '../infrastructure/db/seeds/index.ts';

const env = parseEnv(process.env);
assertSeedAllowed(env.NODE_ENV, env.DATABASE_URL);
await runSeeds(env.DATABASE_URL, SEED_MODULES, console.log);
console.log(`Seeded ${String(SEED_MODULES.length)} module(s).`);
