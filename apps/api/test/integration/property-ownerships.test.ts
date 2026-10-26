import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { contacts, properties } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { PropertyOwnershipService } from '../../src/modules/crm/app/property-ownership-service.ts';
import { propertyOwnershipAdminRouter } from '../../src/modules/crm/handlers/property-ownership-admin-handlers.ts';
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
      propertyOwnershipAdminRouter(new PropertyOwnershipService(connection.db)),
    ],
  });
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

describe('property ownerships admin API', () => {
  it('lists seeded ownership and upserts a co-owner', async () => {
    const agent = request.agent(buildApp());
    await agent
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
      .expect(200);

    const [listing] = await connection.db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.slug, 'demo-tristaen-malinova-dolina'))
      .limit(1);
    const [buyer] = await connection.db
      .select({ id: contacts.id })
      .from(contacts)
      .where(eq(contacts.email, 'client.ivanov@example.com'))
      .limit(1);
    if (listing === undefined || buyer === undefined) {
      throw new Error('expected seeded property and buyer contact');
    }

    const listed = await agent.get(`/v1/admin/properties/${listing.id}/owners`).expect(200);
    const listBody = listed.body as { data: { role: string; contactId: string }[] };
    expect(listBody.data.some((row) => row.role === 'owner')).toBe(true);

    const upserted = await agent
      .put(`/v1/admin/properties/${listing.id}/owners`)
      .send({
        contactId: buyer.id,
        role: 'co_owner',
        agreementStartsOn: '2026-03-01',
        notes: 'Demo co-owner',
      })
      .expect(200);
    const upsertBody = upserted.body as { data: { id: string; role: string } };
    expect(upsertBody.data.role).toBe('co_owner');

    await agent
      .delete(`/v1/admin/properties/${listing.id}/owners/${upsertBody.data.id}`)
      .expect(204);
  });
});
