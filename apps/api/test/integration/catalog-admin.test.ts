import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { catalogAdminRouter } from '../../src/modules/catalog/handlers/catalog-admin-handlers.ts';
import { CatalogRepo } from '../../src/modules/catalog/repo/catalog-repo.ts';
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

interface ListBody<T> {
  data: T[];
}

interface ItemBody<T> {
  data: T;
}

interface LocationItem {
  id: string;
  kind: string;
  slug: string;
  archivedAt: string | null;
  name: { bg: string; en: string };
}

interface TaxonomyItem {
  id: string;
  key: string;
  archivedAt: string | null;
  name: { bg: string; en: string };
}

function buildApp() {
  const auth = new AuthService(new UserRepo(connection.db), env.AUTH_SESSION_TTL_HOURS);
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, catalogAdminRouter(new CatalogRepo(connection.db))],
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

describe('catalog admin API', () => {
  it('lists locations and creates / archives without hard delete', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/locations').expect(200);
    const listBody = list.body as ListBody<LocationItem>;
    expect(listBody.data.length).toBeGreaterThan(0);
    expect(listBody.data.every((row) => row.archivedAt === null)).toBe(true);

    const created = await agent
      .post('/v1/admin/locations')
      .send({
        kind: 'city',
        slug: 'plovdiv-demo',
        sortOrder: 99,
        name: { bg: 'Пловдив демо', en: 'Plovdiv demo' },
      })
      .expect(201);
    const createdBody = created.body as ItemBody<LocationItem>;
    expect(createdBody.data.slug).toBe('plovdiv-demo');
    expect(createdBody.data.name.en).toBe('Plovdiv demo');

    const archived = await agent
      .post(`/v1/admin/locations/${createdBody.data.id}/archive`)
      .expect(200);
    expect((archived.body as ItemBody<LocationItem>).data.archivedAt).not.toBeNull();

    const active = await agent.get('/v1/admin/locations').expect(200);
    expect(
      (active.body as ListBody<LocationItem>).data.some((row) => row.id === createdBody.data.id),
    ).toBe(false);

    const withArchived = await agent.get('/v1/admin/locations?includeArchived=true').expect(200);
    expect(
      (withArchived.body as ListBody<LocationItem>).data.some(
        (row) => row.id === createdBody.data.id,
      ),
    ).toBe(true);
  });

  it('lists and archives property types', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/taxonomies/property_types').expect(200);
    const listBody = list.body as ListBody<TaxonomyItem>;
    expect(listBody.data.some((row) => row.key === 'apartment')).toBe(true);

    const created = await agent
      .post('/v1/admin/taxonomies/property_types')
      .send({
        key: 'studio_demo',
        sortOrder: 50,
        name: { bg: 'Студио демо', en: 'Studio demo' },
      })
      .expect(201);
    const id = (created.body as ItemBody<TaxonomyItem>).data.id;

    await agent
      .patch(`/v1/admin/taxonomies/property_types/${id}`)
      .send({ name: { bg: 'Студио', en: 'Studio' } })
      .expect(200);

    const archived = await agent
      .post(`/v1/admin/taxonomies/property_types/${id}/archive`)
      .expect(200);
    expect((archived.body as ItemBody<TaxonomyItem>).data.archivedAt).not.toBeNull();
  });

  it('rejects catalog writes without a session', async () => {
    await request(buildApp()).get('/v1/admin/locations').expect(401);
  });
});
