import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { ownerReportSnapshots, properties } from '../../src/infrastructure/db/schema.ts';
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

describe('owner reports admin API', () => {
  it('generates append-only snapshot without buyer PII', async () => {
    const agent = await loginAgent();
    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    expect(property).toBeDefined();
    if (property === undefined) return;

    await request(buildApp())
      .post('/v1/public/analytics/events')
      .set('User-Agent', 'Mozilla/5.0')
      .send({
        propertyId: property.id,
        eventType: 'page_view',
        sessionKey: 'owner-report-session-1',
      })
      .expect(201);

    const create = await agent
      .post('/v1/admin/analytics/owner-reports')
      .send({
        propertyId: property.id,
        kind: 'short',
        brokerComment: 'Steady interest this week.',
      })
      .expect(201);

    const createBody = create.body as { data: { id: string } };
    expect(createBody.data.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );

    const list = await agent
      .get(`/v1/admin/analytics/owner-reports?propertyId=${property.id}`)
      .expect(200);

    const listBody = list.body as {
      data: {
        payload: {
          methodology: { noBuyerPii: boolean };
          funnelCounts: { inquiries: number; viewings: number; offers: number };
          views: { totalEvents: number };
        };
        brokerComment: string;
      }[];
    };
    expect(listBody.data).toHaveLength(1);
    const snapshot = listBody.data[0];
    expect(snapshot).toBeDefined();
    if (snapshot === undefined) return;
    expect(snapshot.payload.methodology.noBuyerPii).toBe(true);
    expect(snapshot.payload.views.totalEvents).toBeGreaterThanOrEqual(1);
    expect(snapshot.brokerComment).toBe('Steady interest this week.');
    expect(JSON.stringify(snapshot.payload)).not.toMatch(/@example\.com/);

    await agent
      .post('/v1/admin/analytics/owner-reports')
      .send({ propertyId: property.id, kind: 'detailed' })
      .expect(201);

    const rows = await connection.db
      .select()
      .from(ownerReportSnapshots)
      .where(eq(ownerReportSnapshots.propertyId, property.id));
    expect(rows).toHaveLength(2);
  });
});
