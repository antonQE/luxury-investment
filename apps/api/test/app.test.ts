import express from 'express';
import { pino } from 'pino';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import { createApp } from '../src/app.ts';
import { withValidation } from '../src/infrastructure/server/middleware/validate.ts';

interface ErrorBody {
  error: { code: string; message: string; details?: unknown };
}

const logger = pino({ level: 'silent' });
const env = { API_CORS_ORIGINS: ['http://localhost:3000'] };

function appWith(router?: express.Router) {
  return createApp({ env, logger, publicRouters: router ? [router] : [] });
}

describe('GET /health', () => {
  it('reports ok and the package version when all checks pass', async () => {
    const app = createApp({
      env,
      logger,
      healthChecks: [{ name: 'database', check: () => Promise.resolve(true) }],
    });
    const res = await request(app).get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', components: { database: 'up' } });
    expect((res.body as { version: string }).version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('answers 503 when a check fails or throws', async () => {
    const app = createApp({
      env,
      logger,
      healthChecks: [
        { name: 'database', check: () => Promise.reject(new Error('down')) },
        { name: 'other', check: () => Promise.resolve(true) },
      ],
    });
    const res = await request(app).get('/health').expect(503);
    expect(res.body).toMatchObject({
      status: 'degraded',
      components: { database: 'down', other: 'up' },
    });
  });
});

describe('error format', () => {
  it('returns NOT_FOUND for unknown routes', async () => {
    const res = await request(appWith()).get('/v1/public/nothing-here').expect(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'The resource was not found.' },
    });
  });

  it('hides unexpected errors behind INTERNAL', async () => {
    const router = express.Router();
    router.get('/boom', () => {
      throw new Error('secret detail');
    });
    const res = await request(appWith(router)).get('/v1/public/boom').expect(500);
    expect(res.body).toEqual({ error: { code: 'INTERNAL', message: 'Something went wrong.' } });
  });

  it('reports malformed JSON bodies as VALIDATION_FAILED', async () => {
    const router = express.Router();
    router.post('/echo', (_req, res) => {
      res.json({});
    });
    const res = await request(appWith(router))
      .post('/v1/public/echo')
      .set('content-type', 'application/json')
      .send('{"broken":')
      .expect(400);
    expect((res.body as ErrorBody).error.code).toBe('VALIDATION_FAILED');
  });
});

describe('withValidation', () => {
  const router = express.Router();
  router.post(
    '/items/:id',
    withValidation(
      {
        params: z.object({ id: z.coerce.number().int().positive() }),
        query: z.object({ lang: z.enum(['bg', 'en']).default('bg') }),
        body: z.object({ name: z.string().min(1) }),
      },
      ({ params, query, body }, _req, res) => {
        res.json({ id: params.id, lang: query.lang, name: body.name });
      },
    ),
  );
  const app = appWith(router);

  it('passes parsed and coerced input to the handler', async () => {
    const res = await request(app).post('/v1/public/items/7').send({ name: 'Villa' }).expect(200);
    expect(res.body).toEqual({ id: 7, lang: 'bg', name: 'Villa' });
  });

  it('collects issues from every part of the request', async () => {
    const res = await request(app)
      .post('/v1/public/items/abc?lang=de')
      .send({ name: '' })
      .expect(400);
    const { error } = res.body as ErrorBody;
    expect(error.code).toBe('VALIDATION_FAILED');
    const locations = (error.details as { location: string }[]).map((d) => d.location);
    expect(locations).toEqual(['params', 'query', 'body']);
  });
});

describe('GET /v1/public/meta', () => {
  it('exposes the locales from the shared package', async () => {
    const res = await request(appWith()).get('/v1/public/meta').expect(200);
    expect(res.body).toEqual({ data: { locales: ['bg', 'en'], defaultLocale: 'bg' } });
  });
});
