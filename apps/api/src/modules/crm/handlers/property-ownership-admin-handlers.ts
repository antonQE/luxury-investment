import { upsertPropertyOwnershipSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { PropertyOwnershipService } from '../app/property-ownership-service.ts';
import type { PropertyOwnershipRow } from '../repo/property-ownership-repo.ts';

const propertyParams = z.object({ id: z.uuid() });
const ownershipParams = z.object({ id: z.uuid(), ownershipId: z.uuid() });

function requireProperty(
  permission: 'properties:read' | 'properties:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) {
    throw new AppError('FORBIDDEN');
  }
}

function serialize(row: PropertyOwnershipRow) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    contactId: row.contactId,
    role: row.role,
    agreementStartsOn: row.agreementStartsOn,
    agreementEndsOn: row.agreementEndsOn,
    notes: row.notes,
    contact: {
      displayName: row.contactDisplayName,
      email: row.contactEmail,
      phone: row.contactPhone,
    },
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function propertyOwnershipAdminRouter(service: PropertyOwnershipService): Router {
  const router = Router();

  router.get(
    '/properties/:id/owners',
    withValidation({ params: propertyParams }, async ({ params }, req, res) => {
      requireProperty('properties:read', req.auth?.permissions);
      const rows = await service.list(params.id);
      res.json({ data: rows.map(serialize) });
    }),
  );

  router.put(
    '/properties/:id/owners',
    withValidation(
      { params: propertyParams, body: upsertPropertyOwnershipSchema },
      async ({ params, body }, req, res) => {
        requireProperty('properties:write', req.auth?.permissions);
        const row = await service.upsert(params.id, body);
        res.json({ data: serialize(row) });
      },
    ),
  );

  router.delete(
    '/properties/:id/owners/:ownershipId',
    withValidation({ params: ownershipParams }, async ({ params }, req, res) => {
      requireProperty('properties:write', req.auth?.permissions);
      await service.remove(params.id, params.ownershipId);
      res.status(204).end();
    }),
  );

  return router;
}
