import { pino } from 'pino';

import type { Env } from '../config/env.ts';

export type Logger = pino.Logger;

export function createLogger(env: Pick<Env, 'API_LOG_LEVEL'>): Logger {
  return pino({
    level: env.API_LOG_LEVEL,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
      censor: '[redacted]',
    },
  });
}
