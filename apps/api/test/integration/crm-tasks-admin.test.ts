import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { users } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { crmTaskAdminRouter } from '../../src/modules/crm/handlers/crm-task-admin-handlers.ts';
import { CrmTaskRepo } from '../../src/modules/crm/repo/crm-task-repo.ts';
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
    adminRouters: [mounted.protectedRouter, crmTaskAdminRouter(new CrmTaskRepo(connection.db))],
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

describe('admin crm tasks API', () => {
  it('lists seed tasks, creates, and completes', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/crm-tasks').expect(200);
    const rows = (list.body as { data: { title: string; status: string }[] }).data;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.status === 'open')).toBe(true);

    const [user] = await connection.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);
    expect(user).toBeDefined();
    if (user === undefined) throw new Error('expected demo admin');

    const created = await agent
      .post('/v1/admin/crm-tasks')
      .send({
        title: 'Manual demo task',
        notes: 'Created in test',
        kind: 'manual',
        assigneeId: user.id,
        dueAt: new Date(Date.now() + 86_400_000).toISOString(),
      })
      .expect(201);

    const createdBody = created.body as { data: { id: string; status: string } };
    expect(createdBody.data.status).toBe('open');

    const completed = await agent
      .post(`/v1/admin/crm-tasks/${createdBody.data.id}/complete`)
      .expect(200);
    expect(
      (completed.body as { data: { status: string; completedAt: string | null } }).data.status,
    ).toBe('completed');
    expect(
      (completed.body as { data: { completedAt: string | null } }).data.completedAt,
    ).toBeTruthy();

    await request(buildApp()).get('/v1/admin/crm-tasks').expect(401);
  });
});
