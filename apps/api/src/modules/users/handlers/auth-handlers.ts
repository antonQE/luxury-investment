import type { CookieOptions, Request, Response, Router } from 'express';
import express from 'express';
import { z } from 'zod';

import type { Env } from '../../../config/env.ts';
import { createRateLimiter } from '../../../infrastructure/server/middleware/rate-limit.ts';
import {
  requireAuth,
  sessionTokenFromRequest,
} from '../../../infrastructure/server/middleware/require-auth.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { AuditService } from '../../audit/app/audit-service.ts';
import type { AuthService } from '../app/auth-service.ts';

type AuthEnv = Pick<
  Env,
  'NODE_ENV' | 'AUTH_COOKIE_NAME' | 'AUTH_SESSION_TTL_HOURS' | 'AUTH_SESSION_SECRET'
>;

const loginBody = z.object({
  email: z.email(),
  password: z.string().min(1),
});

function cookieOptions(env: AuthEnv, maxAgeMs: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
    maxAge: maxAgeMs,
  };
}

function clearCookieOptions(env: AuthEnv): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.NODE_ENV === 'production',
    path: '/',
  };
}

export function authPublicRouter(auth: AuthService, env: AuthEnv, audit?: AuditService): Router {
  const router = express.Router();
  const maxAgeMs = env.AUTH_SESSION_TTL_HOURS * 60 * 60 * 1000;
  const loginLimit = createRateLimiter({ windowMs: 15 * 60_000, max: 20 });

  router.post(
    '/auth/login',
    loginLimit,
    withValidation({ body: loginBody }, async ({ body }, _req, res) => {
      const { token, user } = await auth.login(body.email, body.password);
      if (audit) {
        await audit.record({
          actorUserId: user.id,
          actorEmail: user.email,
          action: 'auth.login',
          resourceType: 'user',
          resourceId: user.id,
        });
      }
      res.cookie(env.AUTH_COOKIE_NAME, token, cookieOptions(env, maxAgeMs));
      res.json({ data: { user } });
    }),
  );

  return router;
}

export function authProtectedRouter(auth: AuthService, env: AuthEnv): Router {
  const router = express.Router();

  router.post('/auth/logout', async (req: Request, res: Response) => {
    const token = sessionTokenFromRequest(req, env.AUTH_COOKIE_NAME);
    await auth.logout(token);
    res.clearCookie(env.AUTH_COOKIE_NAME, clearCookieOptions(env));
    res.status(204).end();
  });

  router.get('/auth/me', (req: Request, res: Response) => {
    res.json({ data: { user: req.auth } });
  });

  router.get('/ping', (_req: Request, res: Response) => {
    res.json({ data: { ok: true } });
  });

  return router;
}

export function mountAdminAuth(
  auth: AuthService,
  env: AuthEnv,
  audit?: AuditService,
): {
  publicRouter: Router;
  protectedRouter: Router;
  gate: ReturnType<typeof requireAuth>;
} {
  return {
    publicRouter: authPublicRouter(auth, env, audit),
    protectedRouter: authProtectedRouter(auth, env),
    gate: requireAuth(auth, env.AUTH_COOKIE_NAME),
  };
}
