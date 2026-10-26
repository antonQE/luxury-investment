import { eq } from 'drizzle-orm';
import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { auditEntries } from '../../src/infrastructure/db/schema.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { AuditService } from '../../src/modules/audit/app/audit-service.ts';
import { calculatorAdminRouter } from '../../src/modules/calculators/handlers/calculator-admin-handlers.ts';
import { CalculatorRulesRepo } from '../../src/modules/calculators/repo/calculator-rules-repo.ts';
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
  const audit = new AuditService(connection.db);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [
      mounted.protectedRouter,
      calculatorAdminRouter(new CalculatorRulesRepo(connection.db), audit),
    ],
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

describe('admin calculator rules API', () => {
  it('lists seed sets, updates a rate with audit, and toggles enable', async () => {
    const agent = await loginAgent();

    const list = await agent.get('/v1/admin/calculator-rule-sets?countryCode=BG').expect(200);
    const sets = (list.body as { data: { id: string; kind: string }[] }).data;
    expect(sets.length).toBeGreaterThan(0);

    const deposit = sets.find((row) => row.kind === 'deposit');
    expect(deposit).toBeDefined();
    if (deposit === undefined) throw new Error('expected deposit set');

    const detail = await agent.get(`/v1/admin/calculator-rule-sets/${deposit.id}`).expect(200);
    const lines = (
      detail.body as { data: { lines: { id: string; costGroup: string; rateValue: string }[] } }
    ).data.lines;
    const depositLine = lines.find((row) => row.costGroup === 'deposit_percent');
    expect(depositLine).toBeDefined();
    if (depositLine === undefined) throw new Error('expected deposit line');

    await agent
      .patch(`/v1/admin/calculator-rule-lines/${depositLine.id}`)
      .send({ rateValue: '12' })
      .expect(200);

    const audits = await connection.db
      .select()
      .from(auditEntries)
      .where(eq(auditEntries.action, 'calculator_rule_line.update'));
    expect(audits.length).toBeGreaterThan(0);

    const toggled = await agent
      .put('/v1/admin/calculator-toggles')
      .send({ kind: 'mortgage', countryCode: 'BG', propertyType: '', enabled: false })
      .expect(200);
    expect((toggled.body as { data: { enabled: boolean } }).data.enabled).toBe(false);

    await request(buildApp()).get('/v1/admin/calculator-rule-sets').expect(401);
  });

  it('creates a rule set and archives it', async () => {
    const agent = await loginAgent();

    const created = await agent
      .post('/v1/admin/calculator-rule-sets')
      .send({
        countryCode: 'AE',
        kind: 'acquisition',
        name: 'Demo AE acquisition',
        currency: 'AED',
        validFrom: '2026-01-01',
        source: 'Demo',
        warning: 'Fictional',
      })
      .expect(201);

    const id = (created.body as { data: { id: string } }).data.id;
    await agent
      .post(`/v1/admin/calculator-rule-sets/${id}/lines`)
      .send({
        costGroup: 'transfer_tax',
        lineType: 'percent_of_price',
        rateValue: '4',
        labelBg: 'Демо ОАЕ данък',
        labelEn: 'Demo AE tax',
      })
      .expect(201);

    const archived = await agent.post(`/v1/admin/calculator-rule-sets/${id}/archive`).expect(200);
    expect((archived.body as { data: { archivedAt: string | null } }).data.archivedAt).toBeTruthy();
  });
});
