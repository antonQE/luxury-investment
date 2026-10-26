import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { count } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { downloadEvents } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DocumentPublicService } from '../../src/modules/documents/app/document-public-service.ts';
import { documentPublicRouter } from '../../src/modules/documents/handlers/document-public-handlers.ts';
import { LocalStorage } from '../../src/modules/media/storage/local-storage.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
let mediaRoot = '';
let app = createApp({
  env: { API_CORS_ORIGINS: [], API_ADMIN_CORS_ORIGINS: [] },
  logger: pino({ level: 'silent' }),
  publicRouters: [],
});

beforeEach(async () => {
  await resetDatabase(connection);
  if (mediaRoot !== '') {
    await rm(mediaRoot, { recursive: true, force: true });
  }
  mediaRoot = await mkdtemp(path.join(tmpdir(), 'li-docs-'));
  process.env.MEDIA_LOCAL_ROOT = mediaRoot;
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
  const storage = new LocalStorage(mediaRoot, 'http://localhost:4000/v1/public/media');
  app = createApp({
    env: { API_CORS_ORIGINS: [], API_ADMIN_CORS_ORIGINS: [] },
    logger: pino({ level: 'silent' }),
    publicRouters: [documentPublicRouter(new DocumentPublicService(connection.db, storage))],
  });
});

afterAll(async () => {
  if (mediaRoot !== '') {
    await rm(mediaRoot, { recursive: true, force: true });
  }
  await connection.close();
});

describe('public document library', () => {
  it('lists public documents grouped by category metadata', async () => {
    const res = await request(app).get('/v1/public/documents').query({ lang: 'en' }).expect(200);
    const body = res.body as {
      data: { slug: string; kind: string; legalSample: boolean; title: string }[];
    };
    expect(body.data.some((row) => row.slug === 'seller-handbook')).toBe(true);
    expect(body.data.some((row) => row.slug === 'demo-power-of-attorney' && row.legalSample)).toBe(
      true,
    );
  });
});

describe('public document download', () => {
  it('streams the seller handbook and records a successful download', async () => {
    const res = await request(app)
      .get('/v1/public/documents/seller-handbook?source=sell-with-us')
      .expect(200);

    expect(res.headers['content-type']).toMatch(/pdf/);
    expect(res.headers['content-disposition']).toContain('seller-handbook-demo.pdf');
    expect(Buffer.isBuffer(res.body) || typeof res.body === 'string').toBe(true);

    const total = (await connection.db.select({ total: count() }).from(downloadEvents))[0]?.total;
    expect(total).toBe(1);
  });

  it('returns 404 for unknown slug without counting success', async () => {
    await request(app).get('/v1/public/documents/missing-doc').expect(404);
    const total = (await connection.db.select({ total: count() }).from(downloadEvents))[0]?.total;
    expect(total).toBe(0);
  });
});
