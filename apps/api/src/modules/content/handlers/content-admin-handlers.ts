import { pageKindSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { ContentAdminService } from '../app/content-admin-service.ts';

const idParams = z.object({ id: z.uuid() });

const createArticleBody = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  titleBg: z.string().min(1),
  titleEn: z.string().min(1),
  excerptBg: z.string().min(1),
  excerptEn: z.string().min(1),
  bodyBg: z.string().min(1),
  bodyEn: z.string().min(1),
  coverUrl: z.url().nullable().optional(),
  authorName: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const createPageBody = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: pageKindSchema,
  titleBg: z.string().min(1),
  titleEn: z.string().min(1),
  bodyBg: z.string().min(1),
  bodyEn: z.string().min(1),
  heroUrl: z.url().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function contentAdminRouter(admin: ContentAdminService): Router {
  const router = Router();

  router.get('/articles', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const rows = await admin.listArticles();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        status: row.status,
        title: row.title,
        coverUrl: row.coverUrl,
        authorName: row.authorName,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.post(
    '/articles',
    withValidation({ body: createArticleBody }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.createArticle(body);
      res.status(201).json({ data: { id: row.id, slug: row.slug } });
    }),
  );

  router.post(
    '/articles/:id/publish',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.publishArticle(params.id);
      res.json({ data: { id: row.id, status: row.status } });
    }),
  );

  router.post(
    '/articles/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.archiveArticle(params.id);
      res.json({ data: { id: row.id, archivedAt: row.archivedAt?.toISOString() ?? null } });
    }),
  );

  router.get('/pages', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const rows = await admin.listPages();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        kind: row.kind,
        status: row.status,
        title: row.title,
        heroUrl: row.heroUrl,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.post(
    '/pages',
    withValidation({ body: createPageBody }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.createPage(body);
      res.status(201).json({ data: { id: row.id, slug: row.slug } });
    }),
  );

  router.post(
    '/pages/:id/publish',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.publishPage(params.id);
      res.json({ data: { id: row.id, status: row.status } });
    }),
  );

  router.post(
    '/pages/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.archivePage(params.id);
      res.json({ data: { id: row.id, archivedAt: row.archivedAt?.toISOString() ?? null } });
    }),
  );

  return router;
}
