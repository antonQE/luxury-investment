import {
  DEFAULT_LOCALE,
  type Locale,
  localeSchema,
  propertyListQuerySchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { PropertyRepo } from '../repo/property-repo.ts';
import { serializeProperty } from '../serializers/property-public-serializer.ts';

const localeQuery = z.object({ lang: localeSchema.optional() });
const slugParams = z.object({ slug: z.string().min(1) });

function localeFrom(lang: Locale | undefined): Locale {
  return lang ?? DEFAULT_LOCALE;
}

export function propertyPublicRouter(repo: PropertyRepo): Router {
  const router = Router();

  router.get(
    '/properties',
    withValidation(
      { query: propertyListQuerySchema.and(localeQuery) },
      async ({ query }, _req, res) => {
        const { items, total } = await repo.getPage(query);
        const locale = localeFrom(query.lang);
        res.json({
          data: items.map((row) => serializeProperty(row, locale)),
          total,
          offset: query.offset,
          limit: query.limit,
        });
      },
    ),
  );

  router.get(
    '/properties/:slug',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const row = await repo.getBySlug(params.slug);
        if (row === undefined) throw new AppError('NOT_FOUND');
        res.json({ data: serializeProperty(row, localeFrom(query.lang)) });
      },
    ),
  );

  return router;
}
