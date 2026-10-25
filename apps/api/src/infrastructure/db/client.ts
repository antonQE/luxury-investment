import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';

import * as schema from './schema.ts';

export type Database = NodePgDatabase<typeof schema>;

export interface DatabaseConnection {
  db: Database;
  ping: () => Promise<boolean>;
  close: () => Promise<void>;
}

export function connectDatabase(url: string): DatabaseConnection {
  const pool = new pg.Pool({ connectionString: url, max: 10 });
  const db = drizzle(pool, { schema, casing: 'snake_case' });

  return {
    db,
    ping: async () => {
      const result = await pool.query<{ ok: number }>('select 1 as ok');
      return result.rows[0]?.ok === 1;
    },
    close: () => pool.end(),
  };
}
