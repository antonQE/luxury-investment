import { DEMO_SOCIAL_SQUARE_KEY } from '@luxury-investment/shared';
import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { brochureExports, properties } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { LocalStorage } from '../../src/modules/media/storage/local-storage.ts';
import { BrochureService } from '../../src/modules/studio/app/brochure-service.ts';
import { PdfRenderer } from '../../src/modules/studio/app/pdf-renderer.ts';
import { studioAdminRouter } from '../../src/modules/studio/handlers/studio-admin-handlers.ts';
import { StudioRepo } from '../../src/modules/studio/repo/studio-repo.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });
const renderer = new PdfRenderer();
const storage = new LocalStorage('.data/test-media-studio-social', 'http://localhost:4000/media');

const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:5173'],
  API_ADMIN_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

function buildApp() {
  const service = new BrochureService(
    new StudioRepo(connection.db),
    storage,
    renderer,
    'http://localhost:3000',
  );
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, studioAdminRouter(service)],
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
});

afterAll(async () => {
  await renderer.close();
  await connection.close();
});

describe('studio social image API', () => {
  it('generates a PNG for square format with badge override', async () => {
    const agent = await loginAgent();
    const [property] = await connection.db
      .select({ id: properties.id, slug: properties.slug })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    expect(property).toBeDefined();
    if (property === undefined) return;

    const create = await agent
      .post('/v1/admin/studio/social/generate')
      .send({
        propertyId: property.id,
        templateKey: DEMO_SOCIAL_SQUARE_KEY,
        badgePreset: 'investment',
      })
      .expect(201);

    const body = create.body as {
      data: { id: string; format: string; byteSize: number; fileName: string };
    };
    expect(body.data.format).toBe('square_1080');
    expect(body.data.byteSize).toBeGreaterThan(1000);
    expect(body.data.fileName).toContain('square_1080.png');

    const download = await agent
      .get(`/v1/admin/studio/brochures/exports/${body.data.id}/download`)
      .expect(200);
    expect(download.headers['content-type']).toMatch(/png/);
    const bytes = Buffer.isBuffer(download.body)
      ? download.body
      : Buffer.from(download.body as string);
    expect(bytes.subarray(0, 8)).toEqual(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    );

    const rows = await connection.db
      .select()
      .from(brochureExports)
      .where(eq(brochureExports.propertyId, property.id));
    expect(rows.some((row) => row.contentType === 'image/png')).toBe(true);
  }, 60_000);
});
