import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express, type RequestHandler, type Router } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';

import type { Env } from './config/env.ts';
import {
  createErrorHandler,
  notFoundHandler,
} from './infrastructure/server/middleware/error-handler.ts';
import { requireAllowedOrigin } from './infrastructure/server/middleware/require-allowed-origin.ts';
import { type HealthCheck, healthRouter } from './infrastructure/server/routes/health.ts';
import { metaRouter } from './infrastructure/server/routes/meta.ts';
import type { Logger } from './utils/logger.ts';

export interface AppDependencies {
  env: Pick<Env, 'API_CORS_ORIGINS' | 'API_ADMIN_CORS_ORIGINS'>;
  logger: Logger;
  healthChecks?: HealthCheck[];
  publicRouters?: Router[];
  /** Mounted before the auth gate (e.g. login). */
  adminPublicRouters?: Router[];
  /** Runs after public admin routes; typically session verification. */
  adminAuthGate?: RequestHandler;
  /** Mounted after the auth gate (authenticated admin APIs). */
  adminRouters?: Router[];
}

export function createApp(deps: AppDependencies): Express {
  const app = express();

  app.disable('x-powered-by');
  // Honor one proxy hop (deploy behind nginx/Caddy). Misconfigured proxy can spoof client IP.
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: deps.env.API_CORS_ORIGINS, credentials: true }));
  app.use(
    pinoHttp({ logger: deps.logger, autoLogging: { ignore: (req) => req.url === '/health' } }),
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.use(healthRouter(deps.healthChecks));

  const publicApi = express.Router();
  publicApi.use(metaRouter());
  for (const router of deps.publicRouters ?? []) publicApi.use(router);
  app.use('/v1/public', publicApi);

  const adminApi = express.Router();
  adminApi.use(requireAllowedOrigin(deps.env.API_ADMIN_CORS_ORIGINS));
  for (const router of deps.adminPublicRouters ?? []) adminApi.use(router);
  if (deps.adminAuthGate) adminApi.use(deps.adminAuthGate);
  for (const router of deps.adminRouters ?? []) adminApi.use(router);
  app.use('/v1/admin', adminApi);

  app.use(notFoundHandler);
  app.use(createErrorHandler(deps.logger));

  return app;
}
