import {
  createDocumentSchema,
  documentDownloadStatsQuerySchema,
  listDocumentsQuerySchema,
  updateDocumentSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { DocumentAdminService } from '../app/document-admin-service.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
});

const idParams = z.object({ id: z.uuid() });
const versionParams = z.object({ id: z.uuid(), versionId: z.uuid() });
const handbookVersionParams = z.object({ versionId: z.uuid() });

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serializeDetail(data: Awaited<ReturnType<DocumentAdminService['getDocument']>>) {
  return {
    id: data.id,
    slug: data.slug,
    kind: data.kind,
    accessLevel: data.accessLevel,
    locale: data.locale,
    source: data.source,
    legalSample: data.legalSample,
    responsibleEditor: data.responsibleEditor,
    currentVersionId: data.currentVersionId,
    archivedAt: data.archivedAt?.toISOString() ?? null,
    titleBg: data.titleBg,
    titleEn: data.titleEn,
    descriptionBg: data.descriptionBg,
    descriptionEn: data.descriptionEn,
    downloadTotal: data.downloadTotal,
    versions: data.versions.map((version) => ({
      id: version.id,
      versionLabel: version.versionLabel,
      fileName: version.fileName,
      contentType: version.contentType,
      byteSize: version.byteSize,
      publishedAt: version.publishedAt?.toISOString() ?? null,
      createdAt: version.createdAt.toISOString(),
      isCurrent: version.isCurrent,
      downloadCount: version.downloadCount,
    })),
    createdAt: data.createdAt.toISOString(),
    updatedAt: data.updatedAt.toISOString(),
  };
}

export function documentAdminRouter(admin: DocumentAdminService): Router {
  const router = Router();

  router.get(
    '/documents',
    withValidation({ query: listDocumentsQuerySchema }, async ({ query }, req, res) => {
      requireContent('content:read', req.auth?.permissions);
      const rows = await admin.listDocuments(query);
      res.json({
        data: rows.map((row) => ({
          id: row.id,
          slug: row.slug,
          kind: row.kind,
          accessLevel: row.accessLevel,
          locale: row.locale,
          source: row.source,
          legalSample: row.legalSample,
          responsibleEditor: row.responsibleEditor,
          currentVersionId: row.currentVersionId,
          archivedAt: row.archivedAt?.toISOString() ?? null,
          titleBg: row.titleBg,
          titleEn: row.titleEn,
          descriptionBg: row.descriptionBg,
          descriptionEn: row.descriptionEn,
          createdAt: row.createdAt.toISOString(),
          updatedAt: row.updatedAt.toISOString(),
        })),
      });
    }),
  );

  router.post(
    '/documents',
    withValidation({ body: createDocumentSchema }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const data = await admin.createDocument(body);
      res.status(201).json({ data: serializeDetail(data) });
    }),
  );

  // Static handbook paths before `/documents/:id`.
  router.get('/documents/seller-handbook', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const data = await admin.getSellerHandbook();
    res.json({ data: serializeDetail(data) });
  });

  router.post('/documents/seller-handbook/versions', upload.single('file'), async (req, res) => {
    requireContent('content:write', req.auth?.permissions);
    const file = req.file;
    if (file === undefined) throw new AppError('VALIDATION_FAILED', 'PDF file is required.');

    const fields = z
      .object({
        versionLabel: z.string().trim().min(1).optional(),
        publish: z.union([z.literal('true'), z.literal('false'), z.boolean()]).optional(),
      })
      .parse(req.body);

    const versionLabel = fields.versionLabel ?? `v-${new Date().toISOString().slice(0, 10)}`;
    const publish = fields.publish === 'true' || fields.publish === true;

    const version = await admin.uploadSellerHandbookVersion({
      versionLabel,
      fileName: file.originalname || 'seller-handbook.pdf',
      contentType: file.mimetype,
      body: file.buffer,
      publish,
    });

    res.status(201).json({
      data: {
        id: version.id,
        versionLabel: version.versionLabel,
        fileName: version.fileName,
        publishedAt: version.publishedAt?.toISOString() ?? null,
      },
    });
  });

  router.post(
    '/documents/seller-handbook/versions/:versionId/publish',
    withValidation({ params: handbookVersionParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const version = await admin.publishSellerHandbookVersion(params.versionId);
      res.json({
        data: {
          id: version.id,
          versionLabel: version.versionLabel,
          publishedAt: version.publishedAt?.toISOString() ?? null,
        },
      });
    }),
  );

  router.get(
    '/documents/:id/download-stats',
    withValidation(
      { params: idParams, query: documentDownloadStatsQuerySchema },
      async ({ params, query }, req, res) => {
        requireContent('content:read', req.auth?.permissions);
        const data = await admin.downloadStats(params.id, query);
        res.json({ data });
      },
    ),
  );

  router.get(
    '/documents/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:read', req.auth?.permissions);
      const data = await admin.getDocument(params.id);
      res.json({ data: serializeDetail(data) });
    }),
  );

  router.patch(
    '/documents/:id',
    withValidation(
      { params: idParams, body: updateDocumentSchema },
      async ({ params, body }, req, res) => {
        requireContent('content:write', req.auth?.permissions);
        const data = await admin.updateDocument(params.id, body);
        res.json({ data: serializeDetail(data) });
      },
    ),
  );

  router.post(
    '/documents/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const data = await admin.archiveDocument(params.id);
      res.json({ data: serializeDetail(data) });
    }),
  );

  router.post('/documents/:id/versions', upload.single('file'), async (req, res) => {
    requireContent('content:write', req.auth?.permissions);
    const params = idParams.parse(req.params);
    const file = req.file;
    if (file === undefined) throw new AppError('VALIDATION_FAILED', 'PDF file is required.');

    const fields = z
      .object({
        versionLabel: z.string().trim().min(1).optional(),
        publish: z.union([z.literal('true'), z.literal('false'), z.boolean()]).optional(),
      })
      .parse(req.body);

    const versionLabel = fields.versionLabel ?? `v-${new Date().toISOString().slice(0, 10)}`;
    const publish = fields.publish === 'true' || fields.publish === true;

    const version = await admin.uploadVersion(params.id, {
      versionLabel,
      fileName: file.originalname || 'document.pdf',
      contentType: file.mimetype,
      body: file.buffer,
      publish,
    });

    res.status(201).json({
      data: {
        id: version.id,
        versionLabel: version.versionLabel,
        fileName: version.fileName,
        publishedAt: version.publishedAt?.toISOString() ?? null,
      },
    });
  });

  router.post(
    '/documents/:id/versions/:versionId/publish',
    withValidation({ params: versionParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const version = await admin.publishVersion(params.id, params.versionId);
      res.json({
        data: {
          id: version.id,
          versionLabel: version.versionLabel,
          publishedAt: version.publishedAt?.toISOString() ?? null,
        },
      });
    }),
  );

  return router;
}
