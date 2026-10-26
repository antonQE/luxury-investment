import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { ContentAdminService } from '../../src/modules/content/app/content-admin-service.ts';
import { contentAdminRouter } from '../../src/modules/content/handlers/content-admin-handlers.ts';
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
      contentAdminRouter(new ContentAdminService(connection.db)),
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

describe('admin content API', () => {
  it('lists, creates, publishes and archives articles', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/articles').expect(200);
    expect((list.body as { data: unknown[] }).data.length).toBeGreaterThan(0);

    const created = await agent
      .post('/v1/admin/articles')
      .send({
        slug: 'demo-new-article',
        titleBg: 'Нова демо статия',
        titleEn: 'New demo article',
        excerptBg: 'Кратко',
        excerptEn: 'Short',
        bodyBg: 'Тяло',
        bodyEn: 'Body',
      })
      .expect(201);
    const id = (created.body as { data: { id: string } }).data.id;

    await agent.post(`/v1/admin/articles/${id}/publish`).expect(200);
    await agent.post(`/v1/admin/articles/${id}/archive`).expect(200);
    await request(buildApp()).get('/v1/admin/articles').expect(401);
  });
});
