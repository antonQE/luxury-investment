import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { portalMeasurements, properties } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { marketingAdminRouter } from '../../src/modules/marketing/handlers/marketing-admin-handlers.ts';
import { MarketingRepo } from '../../src/modules/marketing/repo/marketing-repo.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });

const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:5173'],
  API_ADMIN_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

function buildApp() {
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
    adminRouters: [mounted.protectedRouter, marketingAdminRouter(new MarketingRepo(connection.db))],
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
  await connection.close();
});

describe('marketing admin API', () => {
  it('creates activity, portal listing and appends measurement without overwrite', async () => {
    const agent = await loginAgent();
    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    expect(property).toBeDefined();
    if (property === undefined) return;

    await agent
      .post('/v1/admin/marketing/activities')
      .send({
        propertyId: property.id,
        activityType: 'open_house',
        title: 'Demo open house',
        status: 'planned',
      })
      .expect(201);

    const listing = await agent
      .post('/v1/admin/marketing/portal-listings')
      .send({
        propertyId: property.id,
        portalName: 'alo.bg demo',
        listingUrl: 'https://example.com/alo/demo',
        status: 'published',
        publishedOn: '2026-02-01',
      })
      .expect(201);
    const listingId = (listing.body as { data: { id: string } }).data.id;

    const first = await agent
      .post(`/v1/admin/marketing/portal-listings/${listingId}/measurements`)
      .send({
        measuredOn: '2026-02-08',
        periodLabel: 'week-1',
        views: 100,
        saves: 5,
      })
      .expect(201);
    expect((first.body as { data: { previousCount: number; currentCount: number } }).data).toEqual({
      id: expect.any(String) as string,
      previousCount: 0,
      currentCount: 1,
    });

    const second = await agent
      .post(`/v1/admin/marketing/portal-listings/${listingId}/measurements`)
      .send({
        measuredOn: '2026-02-15',
        periodLabel: 'week-2',
        views: 180,
        saves: 9,
      })
      .expect(201);
    expect(
      (second.body as { data: { previousCount: number; currentCount: number } }).data.previousCount,
    ).toBe(1);
    expect((second.body as { data: { currentCount: number } }).data.currentCount).toBe(2);

    const rows = await connection.db
      .select()
      .from(portalMeasurements)
      .where(eq(portalMeasurements.portalListingId, listingId));
    expect(rows).toHaveLength(2);
    expect(rows.map((row) => row.views).sort((a, b) => a - b)).toEqual([100, 180]);
  });
});
