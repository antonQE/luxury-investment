import {
  contactDuplicatesQuerySchema,
  createContactSchema,
  listContactsQuerySchema,
  updateContactSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { ContactRepo, ContactWithRoles } from '../repo/contact-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireContact(
  permission: 'contacts:read' | 'contacts:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serialize(row: ContactWithRoles) {
  return {
    id: row.id,
    kind: row.kind,
    displayName: row.displayName,
    email: row.email,
    phone: row.phone,
    preferredLocale: row.preferredLocale,
    preferredChannel: row.preferredChannel,
    notes: row.notes,
    legalBasis: row.legalBasis,
    roles: row.roles,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function serializeHint(row: ContactWithRoles) {
  return {
    id: row.id,
    displayName: row.displayName,
    email: row.email,
    phone: row.phone,
    roles: row.roles,
  };
}

export function contactAdminRouter(repo: ContactRepo): Router {
  const router = Router();

  router.get(
    '/contacts',
    withValidation({ query: listContactsQuerySchema }, async ({ query }, req, res) => {
      requireContact('contacts:read', req.auth?.permissions);
      const rows = await repo.list(query);
      res.json({ data: rows.map(serialize) });
    }),
  );

  router.get(
    '/contacts/duplicates',
    withValidation({ query: contactDuplicatesQuerySchema }, async ({ query }, req, res) => {
      requireContact('contacts:read', req.auth?.permissions);
      const rows = await repo.findDuplicateCandidates(query);
      res.json({ data: rows.map(serializeHint) });
    }),
  );

  router.get(
    '/contacts/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContact('contacts:read', req.auth?.permissions);
      const row = await repo.getById(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  router.post(
    '/contacts',
    withValidation({ body: createContactSchema }, async ({ body }, req, res) => {
      requireContact('contacts:write', req.auth?.permissions);
      const row = await repo.create(body);
      const duplicateHints = await repo.findDuplicateCandidates({
        email: body.email,
        phone: body.phone,
        excludeId: row.id,
      });
      res.status(201).json({
        data: serialize(row),
        duplicateHints: duplicateHints.map(serializeHint),
      });
    }),
  );

  router.patch(
    '/contacts/:id',
    withValidation(
      { params: idParams, body: updateContactSchema },
      async ({ params, body }, req, res) => {
        requireContact('contacts:write', req.auth?.permissions);
        const row = await repo.update(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        const duplicateHints = await repo.findDuplicateCandidates({
          email: body.email !== undefined ? body.email : row.email,
          phone: body.phone !== undefined ? body.phone : row.phone,
          excludeId: row.id,
        });
        res.json({
          data: serialize(row),
          duplicateHints: duplicateHints.map(serializeHint),
        });
      },
    ),
  );

  router.post(
    '/contacts/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContact('contacts:write', req.auth?.permissions);
      const row = await repo.archive(params.id);
      if (row === null) throw new AppError('NOT_FOUND');
      res.json({ data: serialize(row) });
    }),
  );

  return router;
}
