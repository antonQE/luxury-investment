import {
  createViewingSchema,
  listViewingsQuerySchema,
  updateViewingSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { ViewingRepo, ViewingRow } from '../repo/viewing-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireInquiry(
  permission: 'inquiries:read' | 'inquiries:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serialize(row: ViewingRow) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    contactId: row.contactId,
    agentId: row.agentId,
    inquiryId: row.inquiryId,
    scheduledAt: row.scheduledAt.toISOString(),
    endsAt: row.endsAt?.toISOString() ?? null,
    locationNote: row.locationNote,
    accessInstructions: row.accessInstructions,
    status: row.status,
    outcomeNote: row.outcomeNote,
    nextActionNote: row.nextActionNote,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function viewingAdminRouter(repo: ViewingRepo): Router {
  const router = Router();

  router.get(
    '/viewings',
    withValidation({ query: listViewingsQuerySchema }, async ({ query }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const rows = await repo.list(query);
      res.json({ data: rows.map(serialize) });
    }),
  );

  router.get(
    '/viewings/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const row = await repo.getById(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  router.post(
    '/viewings',
    withValidation({ body: createViewingSchema }, async ({ body }, req, res) => {
      requireInquiry('inquiries:write', req.auth?.permissions);
      const row = await repo.create(body);
      res.status(201).json({ data: serialize(row) });
    }),
  );

  router.patch(
    '/viewings/:id',
    withValidation(
      { params: idParams, body: updateViewingSchema },
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
