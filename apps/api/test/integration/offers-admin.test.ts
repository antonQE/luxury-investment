import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { contacts, properties } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { offerAdminRouter } from '../../src/modules/crm/handlers/offer-admin-handlers.ts';
import { OfferRepo } from '../../src/modules/crm/repo/offer-repo.ts';
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
    adminRouters: [mounted.protectedRouter, offerAdminRouter(new OfferRepo(connection.db))],
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

describe('admin offers API', () => {
  it('lists seed offers, creates, and updates status', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/offers').expect(200);
    const rows = (list.body as { data: { amount: string; status: string }[] }).data;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.some((row) => row.status === 'submitted')).toBe(true);

    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-kashta-sarafovo'))
      .limit(1);
    const [contact] = await connection.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'client.ivanov@example.com'))
      .limit(1);
    expect(property).toBeDefined();
    expect(contact).toBeDefined();
    if (property === undefined || contact === undefined) throw new Error('expected seed refs');

    const created = await agent
      .post('/v1/admin/offers')
      .send({
        propertyId: property.id,
        contactId: contact.id,
        type: 'rent',
        amount: '1200.00',
        currency: 'EUR',
        validUntil: '2026-11-30',
        terms: 'Demo rent offer',
        status: 'submitted',
      })
      .expect(201);

    const createdBody = created.body as { data: { id: string; type: string } };
    expect(createdBody.data.type).toBe('rent');

    const patched = await agent
      .patch(`/v1/admin/offers/${createdBody.data.id}`)
      .send({ status: 'accepted' })
      .expect(200);
    expect((patched.body as { data: { status: string } }).data.status).toBe('accepted');

    await request(buildApp()).get('/v1/admin/offers').expect(401);
  });
});
