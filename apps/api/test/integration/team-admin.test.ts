import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { LocalStorage } from '../../src/modules/media/storage/local-storage.ts';
import { TeamAdminService } from '../../src/modules/team/app/team-admin-service.ts';
import { TeamPublicService } from '../../src/modules/team/app/team-public-service.ts';
import { teamAdminRouter } from '../../src/modules/team/handlers/team-admin-handlers.ts';
import { teamPublicRouter } from '../../src/modules/team/handlers/team-public-handlers.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });
const storage = new LocalStorage('.data/test-team-media', 'http://localhost:4000/v1/public/media');
const teamMediaPublicBaseUrl = 'http://localhost:4000/v1/public/team-media';

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
  const teamAdmin = new TeamAdminService(connection.db, storage, teamMediaPublicBaseUrl);
  return createApp({
    env,
    logger,
    publicRouters: [teamPublicRouter(new TeamPublicService(connection.db), teamAdmin)],
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, teamAdminRouter(teamAdmin)],
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

  it('loads and updates a full team profile including photo upload', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/team').expect(200);
    const first = (list.body as { data: { id: string; slug: string }[] }).data[0];
    expect(first).toBeDefined();
    if (first === undefined) return;

    const detail = await agent.get(`/v1/admin/team/${first.id}`).expect(200);
    const current = (detail.body as { data: { nameBg: string; roleBg: string } }).data;

    const updated = await agent
      .patch(`/v1/admin/team/${first.id}`)
      .send({
        slug: first.slug,
        kind: 'agent',
        nameBg: `${current.nameBg} Updated`,
        nameEn: 'Updated EN',
        roleBg: current.roleBg,
        roleEn: 'Senior agent',
        bioBg: 'Обновено био',
        bioEn: 'Updated bio',
        email: 'updated@example.com',
        phone: '+359 000 000 001',
        photoUrl: null,
        markets: ['sofia'],
        languages: ['bg', 'en'],
        qualifications: 'Demo qualification',
        sortOrder: 1,
        isPublic: true,
      })
      .expect(200);
    expect((updated.body as { data: { nameBg: string; bioEn: string } }).data.nameBg).toContain(
      'Updated',
    );
    expect((updated.body as { data: { bioEn: string } }).data.bioEn).toBe('Updated bio');

    const jpeg = Buffer.from(
      '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z',
      'base64',
    );
    const photo = await agent
      .post(`/v1/admin/team/${first.id}/photo`)
      .attach('file', jpeg, { filename: 'avatar.jpg', contentType: 'image/jpeg' })
      .expect(200);
    const photoUrl = (photo.body as { data: { photoUrl: string | null } }).data.photoUrl;
    expect(photoUrl).toMatch(/\/v1\/public\/team-media\//);
    if (photoUrl === null) return;

    const path = photoUrl.replace('http://localhost:4000', '');
    await agent.get(path).expect(200);
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
