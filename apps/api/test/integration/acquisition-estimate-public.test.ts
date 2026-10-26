import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { AcquisitionEstimateService } from '../../src/modules/calculators/app/acquisition-estimate-service.ts';
import { DepositEstimateService } from '../../src/modules/calculators/app/deposit-estimate-service.ts';
import { MortgageEstimateService } from '../../src/modules/calculators/app/mortgage-estimate-service.ts';
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
      mortgage: new MortgageEstimateService(connection.db, 'demo-credit-consultant'),
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

describe('GET /v1/public/properties/:slug/acquisition-estimate', () => {
  it('returns purchase price separate from configured fees for a BG listing', async () => {
    const res = await request(app)
      .get('/v1/public/properties/demo-tristaen-malinova-dolina/acquisition-estimate')
      .query({ lang: 'en', price: 200_000 })
      .expect(200);

    const body = res.body as {
      data: {
        status: string;
        purchasePrice: number;
        costsTotal: number | null;
        totalAcquisition: number | null;
        costs: { costGroup: string; amount: number | null }[];
      };
    };

    expect(body.data.status).toBe('ok');
    expect(body.data.purchasePrice).toBe(200_000);
    expect(body.data.costs.map((c) => c.costGroup)).toEqual(
      expect.arrayContaining(['transfer_tax', 'notary', 'bank_appraisal']),
    );
    expect(body.data.costs.every((c) => c.amount !== null)).toBe(true);
    expect(body.data.costsTotal).toBe(6700);
    expect(body.data.totalAcquisition).toBe(206_700);
  });

  it('returns 404 for unknown slug', async () => {
    await request(app).get('/v1/public/properties/missing-slug/acquisition-estimate').expect(404);
  });
});
