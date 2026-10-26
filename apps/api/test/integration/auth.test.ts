import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { auditEntries } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { AuditService } from '../../src/modules/audit/app/audit-service.ts';
import { auditAdminRouter } from '../../src/modules/audit/handlers/audit-admin-handlers.ts';
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

interface UserBody {
  data: { user: { email: string; roleKey: string; displayName: string } };
}

interface AuditBody {
  data: { action: string }[];
}

function buildApp() {
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const audit = new AuditService(connection.db);
  const mounted = mountAdminAuth(auth, env, audit);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, auditAdminRouter(audit)],
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

describe('admin auth', () => {
  it('rejects admin routes without a session', async () => {
    const res = await request(buildApp()).get('/v1/admin/ping').expect(401);
    expect(res.body).toMatchObject({ error: { code: 'UNAUTHENTICATED' } });
  });

  it('logs in with email/password and reaches protected routes via cookie', async () => {
    const agent = request.agent(buildApp());
    const login = await agent
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
      .expect(200);
    const loginBody = login.body as UserBody;
    expect(loginBody.data.user.email).toBe(DEMO_ADMIN_EMAIL);
    expect(loginBody.data.user.roleKey).toBe('main_admin');

    await agent.get('/v1/admin/ping').expect(200);
    const me = await agent.get('/v1/admin/auth/me').expect(200);
    expect((me.body as UserBody).data.user.displayName).toBe('Demo Admin');

    const audit = await agent.get('/v1/admin/audit').expect(200);
    const auditBody = audit.body as AuditBody;
    expect(auditBody.data.some((row) => row.action === 'auth.login')).toBe(true);
    const rows = await connection.db.select().from(auditEntries);
    expect(rows.some((row) => row.action === 'auth.login')).toBe(true);

    await agent.post('/v1/admin/auth/logout').expect(204);
    await agent.get('/v1/admin/ping').expect(401);
  });

  it('rejects a wrong password', async () => {
    await request(buildApp())
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: 'wrong-password' })
      .expect(401);
  });

  it('rejects mutating admin requests from a non-admin Origin', async () => {
    const agent = request.agent(buildApp());
    await agent
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
      .expect(200);

    await agent.post('/v1/admin/auth/logout').set('Origin', 'http://localhost:3000').expect(403);
  });

  it('stores a hashed session id, not the raw cookie token', async () => {
    const agent = request.agent(buildApp());
    const login = await agent
      .post('/v1/admin/auth/login')
      .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
      .expect(200);
    const setCookieHeader = login.headers['set-cookie'];
    const cookieLines: string[] = Array.isArray(setCookieHeader)
      ? setCookieHeader.filter((line): line is string => typeof line === 'string')
      : typeof setCookieHeader === 'string'
        ? [setCookieHeader]
        : [];
    const cookieHeader = cookieLines[0] ?? '';
    expect(cookieHeader.length).toBeGreaterThan(0);
    const match = /li_session=([^;]+)/.exec(cookieHeader);
    expect(match?.[1]).toBeTruthy();
    const rawToken = decodeURIComponent(match?.[1] ?? '');

    const { sessions } = await import('../../src/infrastructure/db/schema.ts');
    const { hashSessionToken } = await import('../../src/modules/users/app/session-token.ts');
    const rows = await connection.db.select().from(sessions);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.id).toBe(hashSessionToken(env.AUTH_SESSION_SECRET, rawToken));
    expect(rows[0]?.id).not.toBe(rawToken);
  });
});
