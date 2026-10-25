import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { AppError } from '../../../errors/app-error.ts';

interface Bucket {
  count: number;
  resetAt: number;
}

/** Tiny in-memory rate limit (single process). Enough for local / first deploy. */
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  key?: (req: Request) => string;
}): RequestHandler {
  const buckets = new Map<string, Bucket>();
  const keyFn = options.key ?? ((req) => req.ip ?? 'unknown');

  return (req: Request, _res: Response, next: NextFunction) => {
    const key = keyFn(req);
    const now = Date.now();
    const existing = buckets.get(key);
    if (existing === undefined || existing.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + options.windowMs });
      next();
      return;
    }
    if (existing.count >= options.max) {
      next(new AppError('RATE_LIMITED'));
      return;
    }
    existing.count += 1;
    next();
  };
}
