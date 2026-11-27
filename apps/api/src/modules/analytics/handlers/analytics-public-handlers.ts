import { randomUUID } from 'node:crypto';

import {
  ingestPropertyEventSchema,
  ingestSiteEventSchema,
  ingestSiteSessionPingSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import { createRateLimiter } from '../../../infrastructure/server/middleware/rate-limit.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { AnalyticsRepo } from '../repo/analytics-repo.ts';

function honeypotFilled(rawBody: unknown): boolean {
  if (rawBody === null || typeof rawBody !== 'object' || !('website' in rawBody)) return false;
  const website = Reflect.get(rawBody, 'website');
  return typeof website === 'string' && website.trim() !== '';
}

export function analyticsPublicRouter(repo: AnalyticsRepo): Router {
  const router = Router();
  const rateLimit = createRateLimiter({ windowMs: 60_000, max: 120 });
  // Heartbeats are chatty; allow a higher burst than page beacons.
  const pingLimit = createRateLimiter({ windowMs: 60_000, max: 240 });

  router.post(
    '/analytics/events',
    rateLimit,
    (req, res, next) => {
      if (honeypotFilled(req.body)) {
        res.status(201).json({ data: { id: 'ok', counted: false } });
        return;
      }
      next();
    },
    withValidation({ body: ingestPropertyEventSchema }, async ({ body }, req, res) => {
      const exists = await repo.propertyExists(body.propertyId);
      if (!exists) throw new AppError('NOT_FOUND');

      const userAgent =
        typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
      const result = await repo.ingestEvent({
        propertyId: body.propertyId,
        eventType: body.eventType,
        sessionKey: body.sessionKey ?? randomUUID(),
        source: body.source,
        deviceClass: body.deviceClass,
        userAgent,
      });
      res.status(201).json({ data: result });
    }),
  );

  router.post(
    '/analytics/site-events',
    rateLimit,
    (req, res, next) => {
      if (honeypotFilled(req.body)) {
        res.status(201).json({ data: { id: 'ok', counted: false } });
        return;
      }
      next();
    },
    withValidation({ body: ingestSiteEventSchema }, async ({ body }, req, res) => {
      const userAgent =
        typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
      const result = await repo.ingestSiteEvent({
        path: body.path,
        eventType: body.eventType,
        label: body.label,
        href: body.href,
        sessionKey: body.sessionKey ?? randomUUID(),
        visitorKey: body.visitorKey ?? '',
        deviceClass: body.deviceClass,
        userAgent,
      });
      res.status(201).json({ data: result });
    }),
  );

  router.post(
    '/analytics/site-session-ping',
    pingLimit,
    (req, res, next) => {
      if (honeypotFilled(req.body)) {
        res.status(201).json({ data: { ok: true, counted: false } });
        return;
      }
      next();
    },
    withValidation({ body: ingestSiteSessionPingSchema }, async ({ body }, req, res) => {
      const userAgent =
        typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
      const result = await repo.ingestSessionPing({
        sessionKey: body.sessionKey,
        visitorKey: body.visitorKey ?? '',
        engagedMsDelta: body.engagedMsDelta,
        userAgent,
      });
      res.status(201).json({ data: result });
    }),
  );

  return router;
}
