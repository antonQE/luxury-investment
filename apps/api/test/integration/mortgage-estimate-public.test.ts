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

describe('GET /v1/public/properties/:slug/mortgage-estimate', () => {
  it('returns monthly payment for seeded BG rate and consultant CTA', async () => {
    const res = await request(app)
      .get('/v1/public/properties/demo-tristaen-malinova-dolina/mortgage-estimate')
      .query({ lang: 'en', price: 200_000, downPayment: 20_000, termYears: 25 })
      .expect(200);

    const body = res.body as {
      data: {
        status: string;
        loanAmount: number | null;
        annualRatePercent: number | null;
        monthlyPayment: number | null;
        consultant: { slug: string; name: string } | null;
      };
    };

    expect(body.data.status).toBe('ok');
    expect(body.data.loanAmount).toBe(180_000);
    expect(body.data.annualRatePercent).toBe(3.5);
    expect(body.data.monthlyPayment).toBe(901.12);
    expect(body.data.consultant?.slug).toBe('demo-credit-consultant');
    expect(body.data.consultant?.name).toContain('Credit');
  });

  it('returns 404 for unknown slug', async () => {
    await request(app).get('/v1/public/properties/missing-slug/mortgage-estimate').expect(404);
  });
});
