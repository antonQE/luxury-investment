import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { contacts, properties } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { dealAdminRouter } from '../../src/modules/crm/handlers/deal-admin-handlers.ts';
import { DealRepo } from '../../src/modules/crm/repo/deal-repo.ts';
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
    adminRouters: [mounted.protectedRouter, dealAdminRouter(new DealRepo(connection.db))],
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

describe('admin deals API', () => {
  it('lists seed deals with commission for finance role, creates and moves stage', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/deals').expect(200);
    const rows = (
      list.body as {
        data: { stage: string; commissionAmount: string | null; agreedPrice: string | null }[];
      }
    ).data;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0]?.stage).toBe('preliminary');
    // Demo admin is main_admin → has finance:read
    expect(rows[0]?.commissionAmount).toBeTruthy();

    const [property] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-kashta-sarafovo'))
      .limit(1);
    const [buyer] = await connection.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'client.ivanov@example.com'))
      .limit(1);
    expect(property).toBeDefined();
    expect(buyer).toBeDefined();
    if (property === undefined || buyer === undefined) throw new Error('expected seed refs');

    const created = await agent
      .post('/v1/admin/deals')
      .send({
        propertyId: property.id,
        buyerContactId: buyer.id,
        stage: 'negotiation',
        agreedPrice: '450000.00',
        currency: 'EUR',
        commissionAmount: '13500.00',
        notes: 'New demo deal',
      })
      .expect(201);

    const createdBody = created.body as { data: { id: string; stage: string } };
    expect(createdBody.data.stage).toBe('negotiation');

    const patched = await agent
      .patch(`/v1/admin/deals/${createdBody.data.id}`)
      .send({ stage: 'notary' })
      .expect(200);
    expect((patched.body as { data: { stage: string } }).data.stage).toBe('notary');

    await request(buildApp()).get('/v1/admin/deals').expect(401);
  });
});
