import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { TeamAdminService } from '../../src/modules/team/app/team-admin-service.ts';
import { teamAdminRouter } from '../../src/modules/team/handlers/team-admin-handlers.ts';
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

function buildApp() {
  const auth = new AuthService(new UserRepo(connection.db), env.AUTH_SESSION_TTL_HOURS);
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, teamAdminRouter(new TeamAdminService(connection.db))],
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

describe('admin team API', () => {
  it('lists, creates and archives team members', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/team').expect(200);
    expect((list.body as { data: unknown[] }).data.length).toBeGreaterThan(0);

    const created = await agent
      .post('/v1/admin/team')
      .send({
        slug: 'demo-new-agent',
        kind: 'agent',
        nameBg: 'Нов демо',
        nameEn: 'New demo',
        roleBg: 'Брокер',
        roleEn: 'Agent',
      })
      .expect(201);
    const id = (created.body as { data: { id: string } }).data.id;

    await agent.post(`/v1/admin/team/${id}/archive`).expect(200);
    await request(buildApp()).get('/v1/admin/team').expect(401);
  });

  it('lists, creates and archives offices', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/offices').expect(200);
    expect((list.body as { data: unknown[] }).data.length).toBeGreaterThan(0);

    const created = await agent
      .post('/v1/admin/offices')
      .send({
        slug: 'demo-new-office',
        nameBg: 'Нов офис',
        nameEn: 'New office',
        addressBg: 'ул. Демо 1',
        addressEn: 'Demo St 1',
        mapQuery: 'Sofia Demo Office',
        phone: '+359 000 000 099',
        email: 'office.new@example.com',
      })
      .expect(201);
    const id = (created.body as { data: { id: string } }).data.id;

    await agent.post(`/v1/admin/offices/${id}/archive`).expect(200);
  });
});
