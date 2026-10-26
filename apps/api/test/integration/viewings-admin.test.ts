import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { contacts, properties, users } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { viewingAdminRouter } from '../../src/modules/crm/handlers/viewing-admin-handlers.ts';
import { ViewingRepo } from '../../src/modules/crm/repo/viewing-repo.ts';
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
    adminRouters: [mounted.protectedRouter, viewingAdminRouter(new ViewingRepo(connection.db))],
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

describe('admin viewings API', () => {
  it('lists seed viewings, creates, and updates outcome', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/viewings').expect(200);
    const seeded = (list.body as { data: { status: string; locationNote: string }[] }).data;
    expect(seeded.length).toBeGreaterThan(0);
    expect(seeded.some((row) => row.status === 'confirmed')).toBe(true);

    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    const [contact] = await connection.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'client.ivanov@example.com'))
      .limit(1);
    const [user] = await connection.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);
    expect(property).toBeDefined();
    expect(contact).toBeDefined();
    expect(user).toBeDefined();
    if (property === undefined || contact === undefined || user === undefined) {
      throw new Error('expected seed refs');
    }

    const created = await agent
      .post('/v1/admin/viewings')
      .send({
        propertyId: property.id,
        contactId: contact.id,
        agentId: user.id,
        scheduledAt: '2026-11-12T14:00:00.000Z',
        endsAt: '2026-11-12T15:00:00.000Z',
        locationNote: 'Demo unit 12',
        status: 'scheduled',
      })
      .expect(201);

    const createdBody = created.body as { data: { id: string; status: string } };
    expect(createdBody.data.status).toBe('scheduled');

    const patched = await agent
      .patch(`/v1/admin/viewings/${createdBody.data.id}`)
      .send({
        status: 'completed',
        outcomeNote: 'Liked the layout. Demo feedback.',
        nextActionNote: 'Prepare offer draft',
      })
      .expect(200);

    const patchedBody = patched.body as {
      data: { status: string; outcomeNote: string; nextActionNote: string };
    };
    expect(patchedBody.data.status).toBe('completed');
    expect(patchedBody.data.outcomeNote).toContain('layout');
    expect(patchedBody.data.nextActionNote).toContain('offer');

    const ranged = await agent
      .get('/v1/admin/viewings')
      .query({
        from: '2026-11-12T00:00:00.000Z',
        to: '2026-11-12T23:59:59.000Z',
      })
      .expect(200);
    const rangeRows = (ranged.body as { data: { id: string }[] }).data;
    expect(rangeRows.some((row) => row.id === createdBody.data.id)).toBe(true);

    await request(buildApp()).get('/v1/admin/viewings').expect(401);
  });
});
