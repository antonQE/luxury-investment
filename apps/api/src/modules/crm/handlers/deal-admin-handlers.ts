import {
  createDealSchema,
  listDealsQuerySchema,
  updateDealSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { DealRepo, DealRow } from '../repo/deal-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireInquiry(
  permission: 'inquiries:read' | 'inquiries:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function canReadFinance(permissions: string[] | undefined): boolean {
  return permissions?.includes('finance:read') === true;
}

function serialize(row: DealRow, includeCommission: boolean) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    buyerContactId: row.buyerContactId,
    sellerContactId: row.sellerContactId,
    offerId: row.offerId,
    stage: row.stage,
    agreedPrice: row.agreedPrice,
    currency: row.currency,
    commissionAmount: includeCommission ? row.commissionAmount : null,
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function dealAdminRouter(repo: DealRepo): Router {
  const router = Router();

  router.get(
    '/deals',
    withValidation({ query: listDealsQuerySchema }, async ({ query }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const includeCommission = canReadFinance(req.auth?.permissions);
      const rows = await repo.list(query);
      res.json({ data: rows.map((row) => serialize(row, includeCommission)) });
    }),
  );

  router.get(
    '/deals/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const row = await repo.getById(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row, canReadFinance(req.auth?.permissions)) });
    }),
  );

  router.post(
    '/deals',
    withValidation({ body: createDealSchema }, async ({ body }, req, res) => {
      requireInquiry('inquiries:write', req.auth?.permissions);
      const input = canReadFinance(req.auth?.permissions)
        ? body
        : { ...body, commissionAmount: null };
      const row = await repo.create(input);
      res.status(201).json({ data: serialize(row, canReadFinance(req.auth?.permissions)) });
    }),
  );

  router.patch(
    '/deals/:id',
    withValidation(
      { params: idParams, body: updateDealSchema },
      async ({ params, body }, req, res) => {
        requireInquiry('inquiries:write', req.auth?.permissions);
        const patch = canReadFinance(req.auth?.permissions)
          ? body
          : { ...body, commissionAmount: undefined };
        const row = await repo.update(params.id, patch);
        if (row === null) throw new AppError('NOT_FOUND');
        res.json({ data: serialize(row, canReadFinance(req.auth?.permissions)) });
      },
    ),
  );

  return router;
}
