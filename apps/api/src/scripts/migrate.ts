import process from 'node:process';

import { parseEnv } from '../config/env.ts';
import { runMigrations } from '../infrastructure/db/migrate.ts';

const env = parseEnv(process.env);
await runMigrations(env.DATABASE_URL);
console.log('Migrations applied.');
