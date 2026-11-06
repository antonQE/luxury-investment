import {
  channelCopyQuerySchema,
  generateBrochureSchema,
  generateSocialAssetSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { BrochureService } from '../app/brochure-service.ts';

const idParams = z.object({ id: z.uuid() });
const listExportsQuery = z.object({ propertyId: z.uuid() });

function requireStudio(
  permission: 'properties:read' | 'properties:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function studioAdminRouter(service: BrochureService): Router {
  const router = Router();

  router.get('/studio/templates', async (req, res) => {
    requireStudio('properties:read', req.auth?.permissions);
    const rows = await service.listTemplates();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        key: row.key,
        kind: row.kind,
        format: row.format,
        locale: row.locale,
        nameBg: row.nameBg,
        nameEn: row.nameEn,
        defaultToggles: row.defaultToggles,
        badgePreset: row.badgePreset,
      })),
    });
  });

  router.get(
    '/studio/brochures/exports',
    withValidation({ query: listExportsQuery }, async ({ query }, req, res) => {
      requireStudio('properties:read', req.auth?.permissions);
      const rows = await service.listExports(query.propertyId);
      res.json({
        data: rows.map((row) => ({
          id: row.id,
          propertyId: row.propertyId,
          templateId: row.templateId,
          format: row.format,
          toggles: row.toggles,
          listingUrl: row.listingUrl,
          fileName: row.fileName,
          byteSize: row.byteSize,
          createdAt: row.createdAt.toISOString(),
        })),
      });
    }),
  );

  router.post(
    '/studio/brochures/generate',
    withValidation({ body: generateBrochureSchema }, async ({ body }, req, res) => {
      requireStudio('properties:write', req.auth?.permissions);
      const row = await service.generate(body, req.auth?.id ?? null);
      res.status(201).json({
        data: {
          id: row.id,
          propertyId: row.propertyId,
          fileName: row.fileName,
          byteSize: row.byteSize,
          listingUrl: row.listingUrl,
          downloadPath: `/v1/admin/studio/brochures/exports/${row.id}/download`,
          createdAt: row.createdAt.toISOString(),
        },
      });
    }),
  );

  router.get(
    '/studio/brochures/exports/:id/download',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireStudio('properties:read', req.auth?.permissions);
      const file = await service.getExportFile(params.id);
      res.setHeader('Content-Type', file.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
      res.send(file.body);
    }),
  );

  router.post(
    '/studio/social/generate',
    withValidation({ body: generateSocialAssetSchema }, async ({ body }, req, res) => {
      requireStudio('properties:write', req.auth?.permissions);
      const row = await service.generateSocial(body, req.auth?.id ?? null);
      res.status(201).json({
        data: {
          id: row.id,
          propertyId: row.propertyId,
          format: row.format,
          fileName: row.fileName,
          byteSize: row.byteSize,
          listingUrl: row.listingUrl,
          downloadPath: `/v1/admin/studio/brochures/exports/${row.id}/download`,
          createdAt: row.createdAt.toISOString(),
        },
      });
    }),
  );

  router.get(
    '/studio/channel-copy',
    withValidation({ query: channelCopyQuerySchema }, async ({ query }, req, res) => {
      requireStudio('properties:read', req.auth?.permissions);
      const result = await service.getChannelCopy(query.propertyId);
      res.json({ data: result });
    }),
  );

  return router;
}
