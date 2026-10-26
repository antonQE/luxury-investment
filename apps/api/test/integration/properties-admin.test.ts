import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { properties, users } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { PropertyAdminService } from '../../src/modules/properties/app/property-admin-service.ts';
import { PropertyHistoryService } from '../../src/modules/properties/app/property-history-service.ts';
import { propertyAdminRouter } from '../../src/modules/properties/handlers/property-admin-handlers.ts';
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

interface ItemBody {
  data: {
    id: string;
    listingStatus: string;
    responsibleAgentUserId: string | null;
    slug: string;
  };
}

const draftPayload = {
  titleBg: 'Нова чернова',
  titleEn: 'New draft',
  excerptBg: 'Кратко',
  excerptEn: 'Short',
  descriptionBg: 'Описание',
  descriptionEn: 'Description',
  transactionType: 'sale',
  propertyType: 'apartment',
  market: 'sofia',
  country: 'България',
  city: 'София',
  district: 'Изток',
  price: '150000.00',
  currency: 'EUR',
  area: '70.00',
  builtUpArea: '70.00',
  primaryArea: 'built_up',
  primaryAreaLabelBg: 'Застроена площ',
  primaryAreaLabelEn: 'Built-up area',
  imageUrls: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688'],
  agentName: 'Demo Agent',
  agentPhone: '+359 000 000 000',
};

function buildApp() {
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const mounted = mountAdminAuth(auth, env);
  const history = new PropertyHistoryService(connection.db);
  const admin = new PropertyAdminService(connection.db, history);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, propertyAdminRouter(admin)],
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

describe('admin properties API', () => {
  it('creates a draft, rejects publish without agent, then publishes', async () => {
    const agent = await loginAgent();
    const created = await agent.post('/v1/admin/properties').send(draftPayload).expect(201);
    const body = created.body as ItemBody;
    expect(body.data.listingStatus).toBe('draft');

    await agent.post(`/v1/admin/properties/${body.data.id}/publish`).expect(400);

    const [adminUser] = await connection.db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, DEMO_ADMIN_EMAIL))
      .limit(1);
    if (adminUser === undefined) throw new Error('missing admin');

    await agent
      .patch(`/v1/admin/properties/${body.data.id}`)
      .send({ responsibleAgentUserId: adminUser.id })
      .expect(200);

    const published = await agent.post(`/v1/admin/properties/${body.data.id}/publish`).expect(200);
    expect((published.body as ItemBody).data.listingStatus).toBe('published');

    const archived = await agent.post(`/v1/admin/properties/${body.data.id}/archive`).expect(200);
    expect((archived.body as ItemBody).data.listingStatus).toBe('archived');
  });

  it('lists properties for staff and rejects unauthenticated access', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/properties').expect(200);
    expect((list.body as { total: number }).total).toBeGreaterThan(0);

    await request(buildApp()).get('/v1/admin/properties').expect(401);
  });

  it('records slug history when slug changes', async () => {
    const agent = await loginAgent();
    const created = await agent.post('/v1/admin/properties').send(draftPayload).expect(201);
    const id = (created.body as ItemBody).data.id;
    const oldSlug = (created.body as ItemBody).data.slug;

    await agent
      .patch(`/v1/admin/properties/${id}`)
      .send({ slug: 'renamed-draft-listing' })
      .expect(200);

    const [row] = await connection.db
      .select()
      .from(properties)
      .where(eq(properties.id, id))
      .limit(1);
    expect(row?.slug).toBe('renamed-draft-listing');
    expect(oldSlug).not.toBe('renamed-draft-listing');
  });

  it('duplicates a property into a new draft', async () => {
    const agent = await loginAgent();
    const created = await agent.post('/v1/admin/properties').send(draftPayload).expect(201);
    const id = (created.body as ItemBody).data.id;

    const duplicated = await agent.post(`/v1/admin/properties/${id}/duplicate`).expect(201);
    const copy = duplicated.body as ItemBody;
    expect(copy.data.id).not.toBe(id);
    expect(copy.data.listingStatus).toBe('draft');
    expect(copy.data.slug).toContain('-copy-');
  });
});
