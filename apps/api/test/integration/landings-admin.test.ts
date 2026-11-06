import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { landingPages, landingSections } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { LandingAdminService } from '../../src/modules/content/app/landing-admin-service.ts';
import { landingAdminRouter } from '../../src/modules/content/handlers/landing-admin-handlers.ts';
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
    adminRouters: [
      mounted.protectedRouter,
      landingAdminRouter(new LandingAdminService(connection.db)),
    ],
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

describe('landing admin API', () => {
  it('lists the seeded sellers landing and updates sections', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/landings').expect(200);
    const rows = (list.body as { data: { id: string; slug: string; showInNav: boolean }[] }).data;
    const seeded = rows.find((row) => row.slug === 'za-prodavachi');
    expect(seeded).toBeDefined();
    expect(seeded?.showInNav).toBe(false);
    if (seeded === undefined) return;

    const detail = await agent.get(`/v1/admin/landings/${seeded.id}`).expect(200);
    const landing = (detail.body as { data: { sections: unknown[] } }).data;
    expect(landing.sections.length).toBeGreaterThanOrEqual(3);

    const create = await agent
      .post('/v1/admin/landings')
      .send({
        key: 'demo-project-x',
        slug: 'proekt-x',
        titleBg: 'Проект X',
        titleEn: 'Project X',
        showInNav: false,
        sections: [
          {
            type: 'hero',
            payload: { headline: { bg: 'Проект', en: 'Project' } },
          },
          {
            type: 'cta_form',
            payload: { inquirySource: 'landing_project_x' },
          },
        ],
      })
      .expect(201);

    const created = (create.body as { data: { id: string; status: string } }).data;
    expect(created.status).toBe('draft');

    await agent.post(`/v1/admin/landings/${created.id}/publish`).expect(200);

    const [published] = await connection.db
      .select()
      .from(landingPages)
      .where(eq(landingPages.id, created.id))
      .limit(1);
    expect(published?.status).toBe('published');

    const sectionRows = await connection.db
      .select()
      .from(landingSections)
      .where(eq(landingSections.landingPageId, created.id));
    expect(sectionRows).toHaveLength(2);
  });
});
