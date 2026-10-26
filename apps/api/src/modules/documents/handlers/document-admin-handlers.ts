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

const versionParams = z.object({ versionId: z.uuid() });

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function documentAdminRouter(admin: DocumentAdminService): Router {
  const router = Router();

  router.get('/documents/seller-handbook', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const data = await admin.getSellerHandbook();
    res.json({
      data: {
        id: data.id,
        slug: data.slug,
        kind: data.kind,
        currentVersionId: data.currentVersionId,
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
      },
    });
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
    withValidation({ params: versionParams }, async ({ params }, req, res) => {
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

  return router;
}
