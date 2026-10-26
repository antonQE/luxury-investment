import { locationKindSchema, taxonomyKindSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { CatalogRepo } from '../repo/catalog-repo.ts';

const localizedName = z.object({
  bg: z.string().min(1),
  en: z.string().min(1),
});

const listQuery = z.object({
  includeArchived: z
    .enum(['true', 'false'])
    .optional()
    .transform((value) => value === 'true'),
});

const createLocationBody = z.object({
  kind: locationKindSchema,
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  parentId: z.uuid().nullable().optional(),
  code: z.string().min(1).nullable().optional(),
  sortOrder: z.number().int().optional(),
  name: localizedName,
});

const updateLocationBody = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  parentId: z.uuid().nullable().optional(),
  code: z.string().min(1).nullable().optional(),
  sortOrder: z.number().int().optional(),
  name: localizedName.optional(),
});

const createTaxonomyBody = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/),
  sortOrder: z.number().int().optional(),
  name: localizedName,
});

const updateTaxonomyBody = z.object({
  key: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/)
    .optional(),
  sortOrder: z.number().int().optional(),
  name: localizedName.optional(),
});

const idParams = z.object({ id: z.uuid() });
const taxonomyParams = z.object({ kind: taxonomyKindSchema });
const taxonomyIdParams = z.object({ kind: taxonomyKindSchema, id: z.uuid() });

function requireCatalog(
  permission: 'catalog:read' | 'catalog:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) {
    throw new AppError('FORBIDDEN');
  }
}

function serializeLocation(row: Awaited<ReturnType<CatalogRepo['listLocations']>>[number]) {
  return {
    id: row.id,
    kind: row.kind,
    slug: row.slug,
    parentId: row.parentId,
    code: row.code,
    sortOrder: row.sortOrder,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    name: row.name,
  };
}

function serializeTaxonomy(row: Awaited<ReturnType<CatalogRepo['listTaxonomy']>>[number]) {
  return {
    id: row.id,
    key: row.key,
    sortOrder: row.sortOrder,
    archivedAt: row.archivedAt?.toISOString() ?? null,
    name: row.name,
  };
}

export function catalogAdminRouter(catalog: CatalogRepo): Router {
  const router = Router();

  router.get(
    '/locations',
    withValidation({ query: listQuery }, async ({ query }, req, res) => {
      requireCatalog('catalog:read', req.auth?.permissions);
      const rows = await catalog.listLocations(query.includeArchived);
      res.json({ data: rows.map(serializeLocation) });
    }),
  );

  router.post(
    '/locations',
    withValidation({ body: createLocationBody }, async ({ body }, req, res) => {
      requireCatalog('catalog:write', req.auth?.permissions);
      const row = await catalog.createLocation(body);
      res.status(201).json({ data: serializeLocation(row) });
    }),
  );

  router.patch(
    '/locations/:id',
    withValidation(
      { params: idParams, body: updateLocationBody },
      async ({ params, body }, req, res) => {
        requireCatalog('catalog:write', req.auth?.permissions);
        const row = await catalog.updateLocation(params.id, body);
        res.json({ data: serializeLocation(row) });
      },
    ),
  );

  router.post(
    '/locations/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireCatalog('catalog:write', req.auth?.permissions);
      const row = await catalog.archiveLocation(params.id);
      res.json({ data: serializeLocation(row) });
    }),
  );

  router.get(
    '/taxonomies/:kind',
    withValidation(
      { params: taxonomyParams, query: listQuery },
      async ({ params, query }, req, res) => {
        requireCatalog('catalog:read', req.auth?.permissions);
        const rows = await catalog.listTaxonomy(params.kind, query.includeArchived);
        res.json({ data: rows.map(serializeTaxonomy) });
      },
    ),
  );

  router.post(
    '/taxonomies/:kind',
    withValidation(
      { params: taxonomyParams, body: createTaxonomyBody },
      async ({ params, body }, req, res) => {
        requireCatalog('catalog:write', req.auth?.permissions);
        const row = await catalog.createTaxonomy(params.kind, body);
        res.status(201).json({ data: serializeTaxonomy(row) });
      },
    ),
  );

  router.patch(
    '/taxonomies/:kind/:id',
    withValidation(
      { params: taxonomyIdParams, body: updateTaxonomyBody },
      async ({ params, body }, req, res) => {
        requireCatalog('catalog:write', req.auth?.permissions);
        const row = await catalog.updateTaxonomy(params.kind, params.id, body);
        res.json({ data: serializeTaxonomy(row) });
      },
    ),
  );

  router.post(
    '/taxonomies/:kind/:id/archive',
    withValidation({ params: taxonomyIdParams }, async ({ params }, req, res) => {
      requireCatalog('catalog:write', req.auth?.permissions);
      const row = await catalog.archiveTaxonomy(params.kind, params.id);
      res.json({ data: serializeTaxonomy(row) });
    }),
  );

  return router;
}
