import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { AcquisitionEstimateService } from '../../src/modules/calculators/app/acquisition-estimate-service.ts';
import { DepositEstimateService } from '../../src/modules/calculators/app/deposit-estimate-service.ts';
import { calculatorPublicRouter } from '../../src/modules/calculators/handlers/calculator-public-handlers.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });
const app = createApp({
  env: { API_CORS_ORIGINS: [], API_ADMIN_CORS_ORIGINS: [] },
  logger,
  publicRouters: [
    calculatorPublicRouter({
      acquisition: new AcquisitionEstimateService(connection.db),
      deposit: new DepositEstimateService(connection.db),
    }),
  ],
});

beforeEach(async () => {
  await resetDatabase(connection);
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  await connection.close();
});

describe('GET /v1/public/properties/:slug/deposit-estimate', () => {
  it('shows 10% deposit without double-counting the purchase price', async () => {
    const res = await request(app)
      .get('/v1/public/properties/demo-tristaen-malinova-dolina/deposit-estimate')
      .query({ lang: 'en', price: 200_000 })
      .expect(200);

    const body = res.body as {
      data: {
        status: string;
        purchasePrice: number;
        depositPercent: number | null;
        depositAmount: number | null;
        remainingPrice: number | null;
        extraCostsTotal: number | null;
        initialFunds: number | null;
      };
    };

    expect(body.data.status).toBe('ok');
    expect(body.data.purchasePrice).toBe(200_000);
    expect(body.data.depositPercent).toBe(10);
    expect(body.data.depositAmount).toBe(20_000);
    expect(body.data.remainingPrice).toBe(180_000);
    expect((body.data.depositAmount ?? 0) + (body.data.remainingPrice ?? 0)).toBe(200_000);
    expect(body.data.extraCostsTotal).toBe(6700);
    expect(body.data.initialFunds).toBe(26_700);
  });

  it('returns 404 for unknown slug', async () => {
    await request(app).get('/v1/public/properties/missing-slug/deposit-estimate').expect(404);
  });
});
