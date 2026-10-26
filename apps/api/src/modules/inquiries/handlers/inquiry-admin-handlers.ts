import { updateInquiryStatusSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { InquiryRepo } from '../repo/inquiry-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireInquiry(
  permission: 'inquiries:read' | 'inquiries:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serialize(row: {
  id: string;
  type: string;
  propertySlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    type: row.type,
    propertySlug: row.propertySlug,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    consent: row.consent,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function inquiryAdminRouter(repo: InquiryRepo): Router {
  const router = Router();

  router.get('/inquiries', async (req, res) => {
    requireInquiry('inquiries:read', req.auth?.permissions);
    const rows = await repo.list();
    res.json({ data: rows.map(serialize) });
  });

  router.get(
    '/inquiries/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireInquiry('inquiries:read', req.auth?.permissions);
      const row = await repo.getById(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  router.patch(
    '/inquiries/:id',
    withValidation(
      { params: idParams, body: updateInquiryStatusSchema },
      async ({ params, body }, req, res) => {
        requireInquiry('inquiries:write', req.auth?.permissions);
        const row = await repo.updateStatus(params.id, body.status);
        if (row === null) throw new AppError('NOT_FOUND');
        res.json({ data: serialize(row) });
      },
    ),
  );

  return router;
}
