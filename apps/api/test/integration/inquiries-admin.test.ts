import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { inquiryAdminRouter } from '../../src/modules/inquiries/handlers/inquiry-admin-handlers.ts';
import { InquiryRepo } from '../../src/modules/inquiries/repo/inquiry-repo.ts';
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
    adminRouters: [mounted.protectedRouter, inquiryAdminRouter(new InquiryRepo(connection.db))],
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

describe('admin inquiries API', () => {
  it('lists inquiries and updates status', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/inquiries').expect(200);
    const rows = (list.body as { data: { id: string; status: string }[] }).data;
    expect(rows.length).toBeGreaterThan(0);

    const target = rows.find((row) => row.status === 'new');
    expect(target).toBeDefined();
    if (target === undefined) throw new Error('expected a new inquiry in seed');

    const patched = await agent
      .patch(`/v1/admin/inquiries/${target.id}`)
      .send({ status: 'closed' })
      .expect(200);
    expect((patched.body as { data: { status: string } }).data.status).toBe('closed');

    await request(buildApp()).get('/v1/admin/inquiries').expect(401);
  });
});
