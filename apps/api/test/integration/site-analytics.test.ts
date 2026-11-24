import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { properties, siteEvents } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { OwnerReportService } from '../../src/modules/analytics/app/owner-report-service.ts';
import { analyticsAdminRouter } from '../../src/modules/analytics/handlers/analytics-admin-handlers.ts';
import { analyticsPublicRouter } from '../../src/modules/analytics/handlers/analytics-public-handlers.ts';
import { AnalyticsRepo } from '../../src/modules/analytics/repo/analytics-repo.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });

const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:3000'],
  API_ADMIN_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

function buildApp() {
  const repo = new AnalyticsRepo(connection.db);
  const reports = new OwnerReportService(repo);
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    publicRouters: [analyticsPublicRouter(repo)],
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, analyticsAdminRouter(repo, reports)],
  });
}

async function loginAgent() {
  const app = buildApp();
  const agent = request.agent(app);
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

describe('site analytics + property views', () => {
  it('ingests site page_view/click and returns admin summary', async () => {
    const app = buildApp();

    await request(app)
      .post('/v1/public/analytics/site-events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        path: '/obiavi',
        eventType: 'page_view',
        sessionKey: 'site-session-aaaa',
      })
      .expect(201);

    await request(app)
      .post('/v1/public/analytics/site-events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        path: '/obiavi',
        eventType: 'click',
        label: 'Виж обяви',
        href: '/obiavi',
        sessionKey: 'site-session-aaaa',
      })
      .expect(201);

    await request(app)
      .post('/v1/public/analytics/site-events')
      .set('User-Agent', 'Googlebot/2.1')
      .send({
        path: '/obiavi',
        eventType: 'page_view',
        sessionKey: 'bot-site-zzzz',
      })
      .expect(201);

    const rows = await connection.db.select().from(siteEvents);
    expect(rows).toHaveLength(3);
    expect(rows.filter((row) => row.isBot === 1)).toHaveLength(1);

    const agent = await loginAgent();
    const summary = await agent.get('/v1/admin/analytics/site?days=30').expect(200);
    const summaryBody = summary.body as {
      data: {
        pages: { path: string; events: number; uniqueSessions: number }[];
        clicks: { path: string; label: string; href: string; events: number }[];
      };
    };
    expect(summaryBody.data.pages).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ path: '/obiavi', events: 1, uniqueSessions: 1 }),
      ]),
    );
    expect(summaryBody.data.clicks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/obiavi',
          label: 'Виж обяви',
          href: '/obiavi',
          events: 1,
        }),
      ]),
    );
  });

  it('returns lifetime total and unique property views', async () => {
    const app = buildApp();
    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    expect(property).toBeDefined();
    if (property === undefined) return;

    await request(app)
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'viewer-session-1',
      })
      .expect(201);

    await request(app)
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'viewer-session-1',
      })
      .expect(201);

    await request(app)
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Mozilla/5.0 test-browser')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'viewer-session-2',
      })
      .expect(201);

    const agent = await loginAgent();
    const res = await agent
      .get(`/v1/admin/analytics/property-views?ids=${property.id}`)
      .expect(200);

    const viewsBody = res.body as {
      data: { propertyId: string; viewsTotal: number; viewsUnique: number }[];
    };
    expect(viewsBody.data).toEqual([{ propertyId: property.id, viewsTotal: 3, viewsUnique: 2 }]);
  });
});
