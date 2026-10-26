import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { AuditService } from '../../src/modules/audit/app/audit-service.ts';
import { exchangeRatesAdminRouter } from '../../src/modules/exchange-rates/handlers/exchange-rates-admin-handlers.ts';
import { ExchangeRatesRepo } from '../../src/modules/exchange-rates/repo/exchange-rates-repo.ts';
import { propertyPublicRouter } from '../../src/modules/properties/handlers/property-public-handlers.ts';
import { PropertyRepo } from '../../src/modules/properties/repo/property-repo.ts';
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
  const exchangeRates = new ExchangeRatesRepo(connection.db);
  return createApp({
    env,
    logger,
    publicRouters: [
      propertyPublicRouter(new PropertyRepo(connection.db), undefined, exchangeRates),
    ],
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [mounted.protectedRouter, exchangeRatesAdminRouter(exchangeRates, audit)],
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

describe('exchange rates', () => {
  it('seeds EUR/BGN and exposes BGN display equivalent without changing original price', async () => {
    const res = await request(buildApp())
      .get('/v1/public/properties/demo-tristaen-malinova-dolina')
      .query({ lang: 'en', displayCurrency: 'BGN' })
      .expect(200);

    const body = res.body as {
      data: {
        price: number;
        currency: string;
        priceEquivalent: {
          amount: number;
          currency: string;
          source: string;
        } | null;
      };
    };

    expect(body.data.currency).toBe('EUR');
    expect(body.data.priceEquivalent?.currency).toBe('BGN');
    expect(body.data.priceEquivalent?.amount).toBe(
      Math.round(body.data.price * 1.95583 * 100) / 100,
    );
    expect(body.data.priceEquivalent?.source).toContain('Demo');
  });

  it('omits equivalent when no rate exists', async () => {
    const res = await request(buildApp())
      .get('/v1/public/properties/demo-tristaen-malinova-dolina')
      .query({ lang: 'en', displayCurrency: 'AED' })
      .expect(200);

    const body = res.body as { data: { priceEquivalent: unknown } };
    expect(body.data.priceEquivalent).toBeNull();
  });

  it('lists seeded rates for staff with finance:read', async () => {
    const agent = await loginAgent();
    const res = await agent.get('/v1/admin/exchange-rates').expect(200);

    const body = res.body as {
      data: { baseCurrency: string; quoteCurrency: string; rate: string }[];
    };
    expect(body.data.some((row) => row.baseCurrency === 'EUR' && row.quoteCurrency === 'BGN')).toBe(
      true,
    );
  });
});
