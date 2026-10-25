import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import type { AuthService, AuthUser } from '../../../modules/users/app/auth-service.ts';

export type { AuthUser };

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthUser;
  }
}

function cookieValue(req: Request, cookieName: string): string | undefined {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  if (cookies === undefined) return undefined;
  const value = cookies[cookieName];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function sessionTokenFromRequest(req: Request, cookieName: string): string | undefined {
  const fromCookie = cookieValue(req, cookieName);
  if (fromCookie !== undefined) return fromCookie;
  const header = req.get('authorization');
  if (header?.startsWith('Bearer ') === true) {
    const token = header.slice('Bearer '.length).trim();
    return token.length > 0 ? token : undefined;
  }
  return undefined;
}

export function requireAuth(auth: AuthService, cookieName: string): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = await auth.resolveSession(sessionTokenFromRequest(req, cookieName));
      if (user === null) {
        next(new AppError('UNAUTHENTICATED'));
        return;
      }
      req.auth = user;
      next();
    } catch (error) {
      next(error);
    }
  };
}
