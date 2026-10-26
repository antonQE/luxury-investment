import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import sharp from 'sharp';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { mediaAssets, properties } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { MediaService } from '../../src/modules/media/app/media-service.ts';
import { mediaAdminRouter } from '../../src/modules/media/handlers/media-admin-handlers.ts';
import { mediaPublicRouter } from '../../src/modules/media/handlers/media-public-handlers.ts';
import { LocalStorage } from '../../src/modules/media/storage/local-storage.ts';
import { propertyPublicRouter } from '../../src/modules/properties/handlers/property-public-handlers.ts';
import { PropertyRepo } from '../../src/modules/properties/repo/property-repo.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });

const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

let mediaRoot = '';
let media: MediaService;

function buildApp() {
  const auth = new AuthService(new UserRepo(connection.db), env.AUTH_SESSION_TTL_HOURS);
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    publicRouters: [
      propertyPublicRouter(new PropertyRepo(connection.db), media),
      mediaPublicRouter(media),
    ],
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, mediaAdminRouter(media)],
  });
}

async function loginAgent() {
  const agent = request.agent(buildApp());
  await agent
    .post('/v1/admin/auth/login')
    .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
    .expect(200);
  return agent;
}

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
  if (mediaRoot.length > 0) {
    await rm(mediaRoot, { recursive: true, force: true });
  }
  mediaRoot = await mkdtemp(path.join(tmpdir(), 'li-media-test-'));
  const storage = new LocalStorage(mediaRoot, 'http://localhost:4000/v1/public/media');
  media = new MediaService(connection.db, storage, 'http://localhost:4000/v1/public/media');
});

afterAll(async () => {
  if (mediaRoot.length > 0) {
    await rm(mediaRoot, { recursive: true, force: true });
  }
  await connection.close();
});

describe('media upload', () => {
  it('uploads an image, serves public web variant, hides internal from public listing', async () => {
    const [property] = await connection.db
      .select()
      .from(properties)
      .where(eq(properties.listingStatus, 'published'))
      .limit(1);
    if (property === undefined) throw new Error('missing published property');

    const png = await sharp({
      create: { width: 80, height: 60, channels: 3, background: { r: 20, g: 40, b: 80 } },
    })
      .png()
      .toBuffer();

    const agent = await loginAgent();
    const uploaded = await agent
      .post(`/v1/admin/properties/${property.id}/media`)
      .attach('file', png, { filename: 'demo.png', contentType: 'image/png' })
      .expect(201);

    const assetId = (uploaded.body as { data: { id: string; urls: { web: string } } }).data.id;
    expect(assetId).toBeTruthy();

    const web = await request(buildApp()).get(`/v1/public/media/${assetId}/web`).expect(200);
    expect(web.headers['content-type']).toContain('image/jpeg');

    const publicListing = await request(buildApp())
      .get(`/v1/public/properties/${property.slug}`)
      .expect(200);
    const urls = (publicListing.body as { data: { imageUrls: string[] } }).data.imageUrls;
    expect(urls.some((url) => url.includes(assetId))).toBe(true);

    await agent
      .patch(`/v1/admin/properties/${property.id}/media/${assetId}`)
      .send({ visibility: 'internal' })
      .expect(200);

    await request(buildApp()).get(`/v1/public/media/${assetId}/web`).expect(403);

    const after = await request(buildApp())
      .get(`/v1/public/properties/${property.slug}`)
      .expect(200);
    const afterUrls = (after.body as { data: { imageUrls: string[] } }).data.imageUrls;
    expect(afterUrls.some((url) => url.includes(assetId))).toBe(false);

    const rows = await connection.db.select().from(mediaAssets).where(eq(mediaAssets.id, assetId));
    expect(rows[0]?.renditions.thumb).toBeTruthy();
    expect(rows[0]?.renditions.social).toBeTruthy();
  });
});
