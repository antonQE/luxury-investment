import {
  createOfferSchema,
  listOffersQuerySchema,
  updateOfferSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { OfferRepo, OfferRow } from '../repo/offer-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireInquiry(
  permission: 'inquiries:read' | 'inquiries:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serialize(row: OfferRow) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    contactId: row.contactId,
    type: row.type,
    amount: row.amount,
    currency: row.currency,
    validUntil: row.validUntil,
    terms: row.terms,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function offerAdminRouter(repo: OfferRepo): Router {
  const router = Router();

  router.get(
    '/offers',
    withValidation({ query: listOffersQuerySchema }, async ({ query }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const rows = await repo.list(query);
      res.json({ data: rows.map(serialize) });
    }),
  );

  router.get(
    '/offers/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const row = await repo.getById(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  router.post(
    '/offers',
    withValidation({ body: createOfferSchema }, async ({ body }, req, res) => {
      requireInquiry('inquiries:write', req.auth?.permissions);
      const row = await repo.create(body);
      res.status(201).json({ data: serialize(row) });
    }),
  );

  router.patch(
    '/offers/:id',
    withValidation(
      { params: idParams, body: updateOfferSchema },
      async ({ params, body }, req, res) => {
        requireInquiry('inquiries:write', req.auth?.permissions);
        const row = await repo.update(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        res.json({ data: serialize(row) });
      },
    ),
  );

  return router;
}
