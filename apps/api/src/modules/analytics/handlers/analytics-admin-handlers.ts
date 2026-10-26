import { generateOwnerReportSchema, listOwnerReportsQuerySchema } from '@luxury-investment/shared';
import { Router } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { OwnerReportService } from '../app/owner-report-service.ts';
import type { AnalyticsRepo } from '../repo/analytics-repo.ts';

function requireAnalytics(
  permission: 'properties:read' | 'properties:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function analyticsAdminRouter(repo: AnalyticsRepo, reports: OwnerReportService): Router {
  const router = Router();

  router.get(
    '/analytics/owner-reports',
    withValidation({ query: listOwnerReportsQuerySchema }, async ({ query }, req, res) => {
      requireAnalytics('properties:read', req.auth?.permissions);
      const rows = await repo.listOwnerReports(query.propertyId);
      res.json({
        data: rows.map((row) => ({
          id: row.id,
          propertyId: row.propertyId,
          kind: row.kind,
          periodFrom: row.periodFrom,
          periodTo: row.periodTo,
          brokerComment: row.brokerComment,
          payload: row.payload,
          createdAt: row.createdAt.toISOString(),
        })),
      });
    }),
  );

  router.post(
    '/analytics/owner-reports',
    withValidation({ body: generateOwnerReportSchema }, async ({ body }, req, res) => {
      requireAnalytics('properties:write', req.auth?.permissions);
      const row = await reports.generate(body, req.auth?.id ?? null);
      res.status(201).json({
        data: {
          id: row.id,
          propertyId: row.propertyId,
          kind: row.kind,
          periodFrom: row.periodFrom,
          periodTo: row.periodTo,
          createdAt: row.createdAt.toISOString(),
        },
      });
    }),
  );

  return router;
}
