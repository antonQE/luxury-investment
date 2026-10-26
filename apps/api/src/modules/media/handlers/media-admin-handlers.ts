import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { MediaService } from '../app/media-service.ts';
import type { MediaAssetRow } from '../app/media-service.ts';
import { MAX_UPLOAD_BYTES } from '../app/rendition-service.ts';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
});

const propertyParams = z.object({ propertyId: z.uuid() });
const assetParams = z.object({ assetId: z.uuid() });
const propertyAssetParams = z.object({ propertyId: z.uuid(), assetId: z.uuid() });

const patchBody = z.object({
  altBg: z.string().optional(),
  altEn: z.string().optional(),
  captionBg: z.string().optional(),
  captionEn: z.string().optional(),
  visibility: z.enum(['public', 'internal', 'brochure']).optional(),
  sortOrder: z.number().int().optional(),
  isPrimary: z.boolean().optional(),
});

function requireWrite(permissions: string[] | undefined) {
  if (permissions?.includes('properties:write') !== true) {
    throw new AppError('FORBIDDEN');
  }
}

function requireRead(permissions: string[] | undefined) {
  if (permissions?.includes('properties:read') !== true) {
    throw new AppError('FORBIDDEN');
  }
}

function serialize(media: MediaService, row: MediaAssetRow) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    kind: row.kind,
    visibility: row.visibility,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    width: row.width,
    height: row.height,
    sortOrder: row.sortOrder,
    isPrimary: row.isPrimary,
    altBg: row.altBg,
    altEn: row.altEn,
    captionBg: row.captionBg,
    captionEn: row.captionEn,
    urls: {
      original: media.urlFor(row.id, 'original'),
      web: media.urlFor(row.id, 'web'),
      thumb: media.urlFor(row.id, 'thumb'),
      social: media.urlFor(row.id, 'social'),
    },
    archivedAt: row.archivedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mediaAdminRouter(media: MediaService): Router {
  const router = Router();

  router.get(
    '/properties/:propertyId/media',
    withValidation({ params: propertyParams }, async ({ params }, req, res) => {
      requireRead(req.auth?.permissions);
      const rows = await media.listForProperty(params.propertyId);
      res.json({ data: rows.map((row) => serialize(media, row)) });
    }),
  );

  router.post(
    '/properties/:propertyId/media',
    (req, res, next) => {
      upload.single('file')(req, res, (err: unknown) => {
        if (err !== undefined) {
          next(new AppError('VALIDATION_FAILED', 'Invalid upload.'));
          return;
        }
        next();
      });
    },
    withValidation({ params: propertyParams }, async ({ params }, req, res) => {
      requireWrite(req.auth?.permissions);
      const file = req.file;
      if (file === undefined) throw new AppError('VALIDATION_FAILED', 'file is required.');
      const fields = req.body as Record<string, unknown>;
      const visibility = typeof fields.visibility === 'string' ? fields.visibility : 'public';
      const altBg = typeof fields.altBg === 'string' ? fields.altBg : '';
      const altEn = typeof fields.altEn === 'string' ? fields.altEn : '';
      const row = await media.uploadImage({
        propertyId: params.propertyId,
        body: file.buffer,
        mimeType: file.mimetype,
        uploadedByUserId: req.auth?.id,
        visibility,
        altBg,
        altEn,
      });
      res.status(201).json({ data: serialize(media, row) });
    }),
  );

  router.patch(
    '/properties/:propertyId/media/:assetId',
    withValidation(
      { params: propertyAssetParams, body: patchBody },
      async ({ params, body }, req, res) => {
        requireWrite(req.auth?.permissions);
        const row = await media.update(params.assetId, body);
        if (row.propertyId !== params.propertyId) throw new AppError('NOT_FOUND');
        res.json({ data: serialize(media, row) });
      },
    ),
  );

  router.post(
    '/media/:assetId/archive',
    withValidation({ params: assetParams }, async ({ params }, req, res) => {
      requireWrite(req.auth?.permissions);
      const row = await media.archive(params.assetId);
      res.json({ data: serialize(media, row) });
    }),
  );

  return router;
}
