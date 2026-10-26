import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { contactAdminRouter } from '../../src/modules/crm/handlers/contact-admin-handlers.ts';
import { ContactRepo } from '../../src/modules/crm/repo/contact-repo.ts';
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
    adminRouters: [mounted.protectedRouter, contactAdminRouter(new ContactRepo(connection.db))],
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

describe('admin contacts API', () => {
  it('lists seed contacts, creates, updates roles, and archives', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/contacts').expect(200);
    const rows = (list.body as { data: { email: string | null; roles: string[] }[] }).data;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.email === 'client.ivanov@example.com')).toBe(true);

    const created = await agent
      .post('/v1/admin/contacts')
      .send({
        kind: 'person',
        displayName: 'Demo New Buyer',
        email: 'new.buyer@example.com',
        phone: '+359 000 222 001',
        preferredLocale: 'bg',
        preferredChannel: 'email',
        notes: 'Created in test',
        roles: ['buyer'],
      })
      .expect(201);

    const createdBody = created.body as {
      data: { id: string; displayName: string; roles: string[] };
    };
    expect(createdBody.data.displayName).toBe('Demo New Buyer');
    expect(createdBody.data.roles).toEqual(['buyer']);

    const patched = await agent
      .patch(`/v1/admin/contacts/${createdBody.data.id}`)
      .send({ roles: ['buyer', 'investor'], notes: 'Updated roles' })
      .expect(200);
    expect((patched.body as { data: { roles: string[]; notes: string } }).data.roles).toEqual([
      'buyer',
      'investor',
    ]);
    expect((patched.body as { data: { notes: string } }).data.notes).toBe('Updated roles');

    await agent.post(`/v1/admin/contacts/${createdBody.data.id}/archive`).expect(200);

    const active = await agent.get('/v1/admin/contacts').expect(200);
    const activeRows = (active.body as { data: { id: string }[] }).data;
    expect(activeRows.some((row) => row.id === createdBody.data.id)).toBe(false);

    const withArchived = await agent.get('/v1/admin/contacts?includeArchived=true').expect(200);
    const archivedRows = (
      withArchived.body as { data: { id: string; archivedAt: string | null }[] }
    ).data;
    const archived = archivedRows.find((row) => row.id === createdBody.data.id);
    expect(archived?.archivedAt).toBeTruthy();

    await request(buildApp()).get('/v1/admin/contacts').expect(401);
  });

  it('returns duplicate hints by email/phone without merging', async () => {
    const agent = await loginAgent();

    const byEmail = await agent
      .get('/v1/admin/contacts/duplicates')
      .query({ email: 'client.ivanov@example.com' })
      .expect(200);
    const emailHints = (byEmail.body as { data: { email: string | null; displayName: string }[] })
      .data;
    expect(emailHints.length).toBeGreaterThan(0);
    expect(emailHints[0]?.email).toBe('client.ivanov@example.com');

    const created = await agent
      .post('/v1/admin/contacts')
      .send({
        kind: 'person',
        displayName: 'Almost Иванов',
        email: 'client.ivanov@example.com',
        phone: '+359000111001',
        roles: ['buyer'],
      })
      .expect(201);

    const body = created.body as {
      data: { id: string; displayName: string };
      duplicateHints: { id: string; email: string | null }[];
    };
    expect(body.data.displayName).toBe('Almost Иванов');
    expect(body.duplicateHints.length).toBeGreaterThan(0);
    expect(body.duplicateHints.every((hint) => hint.id !== body.data.id)).toBe(true);

    const seed = await agent
      .get('/v1/admin/contacts')
      .expect(200)
      .then((res) =>
        (res.body as { data: { email: string | null; displayName: string }[] }).data.find(
          (row) => row.email === 'client.ivanov@example.com' && row.displayName === 'Demo Иванов',
        ),
      );
    expect(seed?.displayName).toBe('Demo Иванов');
  });
});
