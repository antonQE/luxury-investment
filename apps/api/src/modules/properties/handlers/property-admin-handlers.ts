import {
  marketSchema,
  primaryAreaKeySchema,
  propertyTypeSchema,
  transactionTypeSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { PropertyAdminService } from '../app/property-admin-service.ts';
import type { PropertyRow } from '../repo/property-repo.ts';

const listQuery = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  listingStatus: z.enum(['draft', 'published', 'archived']).optional(),
  includeArchived: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

const writeBody = z.object({
  referenceNumber: z.string().min(1).optional(),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  titleBg: z.string().min(1),
  titleEn: z.string().min(1),
  excerptBg: z.string().min(1),
  excerptEn: z.string().min(1),
  descriptionBg: z.string().min(1),
  descriptionEn: z.string().min(1),
  transactionType: transactionTypeSchema,
  propertyType: propertyTypeSchema,
  market: marketSchema,
  country: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1).nullable().optional(),
  locationId: z.uuid().nullable().optional(),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/),
  currency: z.string().min(1).max(8),
  vatLabel: z.string().min(1).nullable().optional(),
  bedrooms: z.number().int().nullable().optional(),
  bathrooms: z.number().int().nullable().optional(),
  area: z.string().regex(/^\d+(\.\d{1,2})?$/),
  builtUpArea: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  areaWithCommonParts: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/)
    .nullable()
    .optional(),
  primaryArea: primaryAreaKeySchema.optional(),
  primaryAreaLabelBg: z.string().min(1),
  primaryAreaLabelEn: z.string().min(1),
  constructionStage: z.string().min(1).nullable().optional(),
  badges: z.array(z.string()).optional(),
  attributeValues: z.record(z.string(), z.unknown()).optional(),
  imageUrls: z.array(z.url()).min(1),
  agentName: z.string().min(1),
  agentPhone: z.string().min(1),
  responsibleAgentUserId: z.uuid().nullable().optional(),
});

const patchBody = writeBody.partial();
const idParams = z.object({ id: z.uuid() });

function requireProperty(
  permission: 'properties:read' | 'properties:write' | 'properties:publish',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) {
    throw new AppError('FORBIDDEN');
  }
}

function serializeAdmin(row: PropertyRow) {
  return {
    id: row.id,
    referenceNumber: row.referenceNumber,
    slug: row.slug,
    titleBg: row.titleBg,
    titleEn: row.titleEn,
    excerptBg: row.excerptBg,
    excerptEn: row.excerptEn,
    descriptionBg: row.descriptionBg,
    descriptionEn: row.descriptionEn,
    transactionType: row.transactionType,
    propertyType: row.propertyType,
    market: row.market,
    country: row.country,
    city: row.city,
    district: row.district,
    locationId: row.locationId,
    price: row.price,
    currency: row.currency,
    vatLabel: row.vatLabel,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area,
    builtUpArea: row.builtUpArea,
    areaWithCommonParts: row.areaWithCommonParts,
    primaryArea: row.primaryArea,
    primaryAreaLabelBg: row.primaryAreaLabelBg,
    primaryAreaLabelEn: row.primaryAreaLabelEn,
    constructionStage: row.constructionStage,
    badges: row.badges,
    attributeValues: row.attributeValues,
    imageUrls: row.imageUrls,
    agentName: row.agentName,
    agentPhone: row.agentPhone,
    responsibleAgentUserId: row.responsibleAgentUserId,
    listingStatus: row.listingStatus,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function propertyAdminRouter(admin: PropertyAdminService): Router {
  const router = Router();

  router.get(
    '/properties',
    withValidation({ query: listQuery }, async ({ query }, req, res) => {
      requireProperty('properties:read', req.auth?.permissions);
      const { items, total } = await admin.list(query);
      res.json({
        data: items.map(serializeAdmin),
        total,
        offset: query.offset,
        limit: query.limit,
      });
    }),
  );

  router.get(
    '/properties/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireProperty('properties:read', req.auth?.permissions);
      const row = await admin.getById(params.id);
      res.json({ data: serializeAdmin(row) });
    }),
  );

  router.post(
    '/properties',
    withValidation({ body: writeBody }, async ({ body }, req, res) => {
      requireProperty('properties:write', req.auth?.permissions);
      const row = await admin.create(body, req.auth?.id);
      res.status(201).json({ data: serializeAdmin(row) });
    }),
  );

  router.patch(
    '/properties/:id',
    withValidation({ params: idParams, body: patchBody }, async ({ params, body }, req, res) => {
      requireProperty('properties:write', req.auth?.permissions);
      const row = await admin.update(params.id, body, req.auth?.id);
      res.json({ data: serializeAdmin(row) });
    }),
  );

  router.post(
    '/properties/:id/publish',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireProperty('properties:publish', req.auth?.permissions);
      const row = await admin.publish(params.id);
      res.json({ data: serializeAdmin(row) });
    }),
  );

  router.post(
    '/properties/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireProperty('properties:write', req.auth?.permissions);
      const row = await admin.archive(params.id);
      res.json({ data: serializeAdmin(row) });
    }),
  );

  router.post(
    '/properties/:id/duplicate',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireProperty('properties:write', req.auth?.permissions);
      const row = await admin.duplicate(params.id, req.auth?.id);
      res.status(201).json({ data: serializeAdmin(row) });
    }),
  );

  return router;
}
