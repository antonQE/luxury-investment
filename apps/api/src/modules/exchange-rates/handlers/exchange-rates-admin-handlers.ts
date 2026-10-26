import { listExchangeRatesQuerySchema, upsertExchangeRateSchema } from '@luxury-investment/shared';
import { Router } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { AuditService } from '../../audit/app/audit-service.ts';
import type { ExchangeRateRow, ExchangeRatesRepo } from '../repo/exchange-rates-repo.ts';

function requireFinanceRead(permissions: string[] | undefined) {
  if (
    permissions?.includes('finance:read') !== true &&
    permissions?.includes('calculators:read') !== true
  ) {
    throw new AppError('FORBIDDEN');
  }
}

function requireWrite(permissions: string[] | undefined) {
  if (permissions?.includes('calculators:write') !== true) throw new AppError('FORBIDDEN');
}

function serialize(row: ExchangeRateRow) {
  return {
    id: row.id,
    baseCurrency: row.baseCurrency,
    quoteCurrency: row.quoteCurrency,
    rate: row.rate,
    asOf: row.asOf,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function exchangeRatesAdminRouter(repo: ExchangeRatesRepo, audit: AuditService): Router {
  const router = Router();

  router.get(
    '/exchange-rates',
    withValidation({ query: listExchangeRatesQuerySchema }, async ({ query }, req, res) => {
      requireFinanceRead(req.auth?.permissions);
      const rows = await repo.list(query);
      res.json({ data: rows.map(serialize) });
    }),
  );

  router.put(
    '/exchange-rates',
    withValidation({ body: upsertExchangeRateSchema }, async ({ body }, req, res) => {
      requireWrite(req.auth?.permissions);
      if (body.baseCurrency === body.quoteCurrency) {
        throw new AppError('VALIDATION_FAILED', 'base and quote currencies must differ');
      }
      const row = await repo.upsert(body);
      await audit.record({
        actorUserId: req.auth?.id,
        actorEmail: req.auth?.email,
        action: 'exchange_rate.upsert',
        resourceType: 'exchange_rate',
        resourceId: row.id,
        metadata: {
          baseCurrency: row.baseCurrency,
          quoteCurrency: row.quoteCurrency,
          rate: row.rate,
          asOf: row.asOf,
        },
      });
      res.json({ data: serialize(row) });
    }),
  );

  return router;
}
