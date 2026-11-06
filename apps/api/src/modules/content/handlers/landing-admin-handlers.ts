import { createLandingPageSchema, updateLandingPageSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { LandingAdminService } from '../app/landing-admin-service.ts';

const idParams = z.object({ id: z.uuid() });
const publishBody = z.preprocess(
  (value) => value ?? {},
  z.object({
    publishAt: z.iso.datetime().optional(),
  }),
);

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serializeLanding(row: Awaited<ReturnType<LandingAdminService['get']>>) {
  return {
    id: row.id,
    key: row.key,
    slug: row.slug,
    status: row.status,
    titleBg: row.titleBg,
    titleEn: row.titleEn,
    seoTitleBg: row.seoTitleBg,
    seoTitleEn: row.seoTitleEn,
    seoDescriptionBg: row.seoDescriptionBg,
    seoDescriptionEn: row.seoDescriptionEn,
    robots: row.robots,
    showInNav: row.showInNav,
    campaignKey: row.campaignKey,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    sortOrder: row.sortOrder,
    sections: row.sections,
  };
}

export function landingAdminRouter(admin: LandingAdminService): Router {
  const router = Router();

  router.get('/landings', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const rows = await admin.list();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        key: row.key,
        slug: row.slug,
        status: row.status,
        titleBg: row.titleBg,
        titleEn: row.titleEn,
        showInNav: row.showInNav,
        campaignKey: row.campaignKey,
        robots: row.robots,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.get(
    '/landings/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:read', req.auth?.permissions);
      const row = await admin.get(params.id);
      res.json({ data: serializeLanding(row) });
    }),
  );

  router.post(
    '/landings',
    withValidation({ body: createLandingPageSchema }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.create(body);
      res.status(201).json({ data: serializeLanding(row) });
    }),
  );

  router.patch(
    '/landings/:id',
    withValidation(
      { params: idParams, body: updateLandingPageSchema },
      async ({ params, body }, req, res) => {
        requireContent('content:write', req.auth?.permissions);
        const row = await admin.update(params.id, body);
        res.json({ data: serializeLanding(row) });
      },
    ),
  );

  router.post(
    '/landings/:id/publish',
    withValidation({ params: idParams, body: publishBody }, async ({ params, body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.publish(
        params.id,
        body.publishAt !== undefined ? new Date(body.publishAt) : undefined,
      );
      res.json({
        data: {
          id: row.id,
          status: row.status,
          publishedAt: row.publishedAt?.toISOString() ?? null,
        },
      });
    }),
  );

  router.post(
    '/landings/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.archive(params.id);
      res.json({
        data: { id: row.id, archivedAt: row.archivedAt?.toISOString() ?? null },
      });
    }),
  );

  return router;
}
