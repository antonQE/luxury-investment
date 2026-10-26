import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { AppError } from '../../../errors/app-error.ts';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/**
 * Reject mutating requests whose browser `Origin` is not on the allowlist.
 * Missing Origin is allowed (non-browser clients / tests); browsers always send Origin on cross-site fetch.
 */
export function requireAllowedOrigin(allowedOrigins: readonly string[]): RequestHandler {
  const allowed = new Set(allowedOrigins);

  return (req: Request, _res: Response, next: NextFunction) => {
    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }
    const origin = req.headers.origin;
    if (typeof origin !== 'string' || origin === '') {
      next();
      return;
    }
    if (!allowed.has(origin)) {
      next(new AppError('FORBIDDEN', 'Origin not allowed.'));
      return;
    }
    next();
  };
}
