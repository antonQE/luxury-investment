import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { SiteSettingsService } from '../../src/modules/site-settings/app/site-settings-service.ts';
import { siteSettingsAdminRouter } from '../../src/modules/site-settings/handlers/site-settings-admin-handlers.ts';
import { siteSettingsPublicRouter } from '../../src/modules/site-settings/handlers/site-settings-public-handlers.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });
const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:3000'],
  API_ADMIN_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

function buildApp() {
  const service = new SiteSettingsService(connection.db);
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    publicRouters: [siteSettingsPublicRouter(service)],
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, siteSettingsAdminRouter(service)],
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

describe('site settings', () => {
  it('exposes seeded phone/email and lets admin update both', async () => {
    const publicRes = await request(buildApp()).get('/v1/public/site-settings').expect(200);
    const seeded = publicRes.body as {
      data: { publicPhone: string; publicEmail: string };
    };
    expect(seeded.data.publicPhone).toBe('+359 2 000 00 00');
    expect(seeded.data.publicEmail).toBe('hello@example.com');

    const agent = request.agent(buildApp());
    await agent
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
      .expect(200);

    await agent
      .patch('/v1/admin/site-settings')
      .send({ publicPhone: '+359 88 111 22 33', publicEmail: 'office@example.com' })
      .expect(200);

    const updated = await request(buildApp()).get('/v1/public/site-settings').expect(200);
    const body = updated.body as { data: { publicPhone: string; publicEmail: string } };
    expect(body.data.publicPhone).toBe('+359 88 111 22 33');
    expect(body.data.publicEmail).toBe('office@example.com');
  });
});
