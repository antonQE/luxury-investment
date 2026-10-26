import {
  createCrmTaskSchema,
  listCrmTasksQuerySchema,
  updateCrmTaskSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { CrmTaskRepo, CrmTaskRow } from '../repo/crm-task-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireInquiry(
  permission: 'inquiries:read' | 'inquiries:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serialize(row: CrmTaskRow) {
  return {
    id: row.id,
    title: row.title,
    notes: row.notes,
    kind: row.kind,
    status: row.status,
    assigneeId: row.assigneeId,
    dueAt: row.dueAt.toISOString(),
    relatedInquiryId: row.relatedInquiryId,
    relatedViewingId: row.relatedViewingId,
    relatedPropertyId: row.relatedPropertyId,
    relatedContactId: row.relatedContactId,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function crmTaskAdminRouter(repo: CrmTaskRepo): Router {
  const router = Router();

  router.get(
    '/crm-tasks',
    withValidation({ query: listCrmTasksQuerySchema }, async ({ query }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const rows = await repo.list(query);
      res.json({ data: rows.map(serialize) });
    }),
  );

  router.get(
    '/crm-tasks/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const row = await repo.getById(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  router.post(
    '/crm-tasks',
    withValidation({ body: createCrmTaskSchema }, async ({ body }, req, res) => {
      requireInquiry('inquiries:write', req.auth?.permissions);
      const row = await repo.create(body);
      res.status(201).json({ data: serialize(row) });
    }),
  );

  router.patch(
    '/crm-tasks/:id',
    withValidation(
      { params: idParams, body: updateCrmTaskSchema },
      async ({ params, body }, req, res) => {
        requireInquiry('inquiries:write', req.auth?.permissions);
        const row = await repo.update(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        res.json({ data: serialize(row) });
      },
    ),
  );

  router.post(
    '/crm-tasks/:id/complete',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireInquiry('inquiries:write', req.auth?.permissions);
      const row = await repo.update(params.id, { status: 'completed' });
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  return router;
}
