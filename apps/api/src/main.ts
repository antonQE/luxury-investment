import process from 'node:process';

import { createApp } from './app.ts';
import { parseEnv } from './config/env.ts';
import { connectDatabase } from './infrastructure/db/client.ts';
import { propertyPublicRouter } from './modules/properties/handlers/property-public-handlers.ts';
import { PropertyRepo } from './modules/properties/repo/property-repo.ts';
import { createLogger } from './utils/logger.ts';

const env = parseEnv(process.env);
const logger = createLogger(env);
const database = connectDatabase(env.DATABASE_URL);
const propertyRepo = new PropertyRepo(database.db);

const app = createApp({
  env,
  logger,
  healthChecks: [{ name: 'database', check: database.ping }],
  publicRouters: [propertyPublicRouter(propertyRepo)],
});

const server = app.listen(env.API_PORT, () => {
  logger.info(`API listening on http://localhost:${String(env.API_PORT)}`);
});

function shutdown(signal: string): void {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    void database.close().finally(() => process.exit(0));
  });
}

process.on('SIGTERM', () => {
  shutdown('SIGTERM');
});
process.on('SIGINT', () => {
  shutdown('SIGINT');
});
