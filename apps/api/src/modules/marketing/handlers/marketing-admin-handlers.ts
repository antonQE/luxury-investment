import {
  createMarketingActivitySchema,
  createPortalListingSchema,
  createPortalMeasurementSchema,
  listMarketingQuerySchema,
  updateMarketingActivitySchema,
  updatePortalListingSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { MarketingRepo } from '../repo/marketing-repo.ts';

const idParams = z.object({ id: z.uuid() });

function requireMarketing(
  permission: 'properties:read' | 'properties:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function marketingAdminRouter(repo: MarketingRepo): Router {
  const router = Router();

  router.get(
    '/marketing/activities',
    withValidation({ query: listMarketingQuerySchema }, async ({ query }, req, res) => {
      requireMarketing('properties:read', req.auth?.permissions);
      const rows = await repo.listActivities(query.propertyId);
      res.json({
        data: rows.map((row) => ({
          ...row,
          archivedAt: row.archivedAt?.toISOString() ?? null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })),
      });
    }),
  );

  router.post(
    '/marketing/activities',
    withValidation({ body: createMarketingActivitySchema }, async ({ body }, req, res) => {
      requireMarketing('properties:write', req.auth?.permissions);
      const row = await repo.createActivity({
        propertyId: body.propertyId,
        activityType: body.activityType,
        title: body.title,
        ownerUserId: body.ownerUserId ?? null,
        status: body.status,
        startsOn: body.startsOn ?? null,
        endsOn: body.endsOn ?? null,
        costAmount: body.costAmount ?? null,
        costCurrency: body.costCurrency,
        resultNotes: body.resultNotes,
        evidenceUrl: body.evidenceUrl ?? null,
        recurrence: body.recurrence,
      });
      res.status(201).json({ data: { id: row.id } });
    }),
  );

  router.patch(
    '/marketing/activities/:id',
    withValidation(
      { params: idParams, body: updateMarketingActivitySchema },
      async ({ params, body }, req, res) => {
        requireMarketing('properties:write', req.auth?.permissions);
        const row = await repo.updateActivity(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        res.json({ data: { id: row.id } });
      },
    ),
  );

  router.get(
    '/marketing/portal-listings',
    withValidation({ query: listMarketingQuerySchema }, async ({ query }, req, res) => {
      requireMarketing('properties:read', req.auth?.permissions);
      const rows = await repo.listPortalListings(query.propertyId);
      res.json({
        data: rows.map((row) => ({
          ...row,
          archivedAt: row.archivedAt?.toISOString() ?? null,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })),
      });
    }),
  );

  router.post(
    '/marketing/portal-listings',
    withValidation({ body: createPortalListingSchema }, async ({ body }, req, res) => {
      requireMarketing('properties:write', req.auth?.permissions);
      const row = await repo.createPortalListing({
        propertyId: body.propertyId,
        portalName: body.portalName,
        listingUrl: body.listingUrl,
        status: body.status,
        publishedOn: body.publishedOn ?? null,
        notes: body.notes,
      });
      res.status(201).json({ data: { id: row.id } });
    }),
  );

  router.patch(
    '/marketing/portal-listings/:id',
    withValidation(
      { params: idParams, body: updatePortalListingSchema },
      async ({ params, body }, req, res) => {
        requireMarketing('properties:write', req.auth?.permissions);
        const row = await repo.updatePortalListing(params.id, body);
        if (row === null) throw new AppError('NOT_FOUND');
        res.json({ data: { id: row.id } });
      },
    ),
  );

  router.get(
    '/marketing/portal-listings/:id/measurements',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireMarketing('properties:read', req.auth?.permissions);
      const listing = await repo.getPortalListing(params.id);
      if (listing === undefined) throw new AppError('NOT_FOUND');
      const rows = await repo.listMeasurements(params.id);
      res.json({
        data: rows.map((row) => ({
          ...row,
          createdAt: row.createdAt.toISOString(),
        })),
      });
    }),
  );

  router.post(
    '/marketing/portal-listings/:id/measurements',
    withValidation(
      { params: idParams, body: createPortalMeasurementSchema },
      async ({ params, body }, req, res) => {
        requireMarketing('properties:write', req.auth?.permissions);
        const listing = await repo.getPortalListing(params.id);
        if (listing === undefined) throw new AppError('NOT_FOUND');
        const before = await repo.listMeasurements(params.id);
        const row = await repo.appendMeasurement({
          portalListingId: params.id,
          measuredOn: body.measuredOn,
          periodLabel: body.periodLabel,
          views: body.views,
          saves: body.saves,
          metricDefinition: body.metricDefinition,
          enteredByUserId: req.auth?.id ?? null,
          evidenceUrl: body.evidenceUrl ?? null,
          notes: body.notes,
        });
        const after = await repo.listMeasurements(params.id);
        res.status(201).json({
          data: {
            id: row.id,
            previousCount: before.length,
            currentCount: after.length,
          },
        });
      },
    ),
  );

  return router;
}
