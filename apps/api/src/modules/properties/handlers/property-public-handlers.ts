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
import type { MediaService } from '../../media/app/media-service.ts';
import type { PropertyRepo } from '../repo/property-repo.ts';
import type { PropertyRow } from '../repo/property-repo.ts';
import {
  serializeProperty,
  serializePropertyListItem,
} from '../serializers/property-public-serializer.ts';

const localeQuery = z.object({ lang: localeSchema.optional() });
const slugParams = z.object({ slug: z.string().min(1) });

function localeFrom(lang: Locale | undefined): Locale {
  return lang ?? DEFAULT_LOCALE;
}

async function imageUrlsFor(
  media: MediaService | undefined,
  row: PropertyRow,
): Promise<string[] | undefined> {
  if (media === undefined) return undefined;
  const assets = await media.listPublicForProperty(row.id);
  if (assets.length === 0) return undefined;
  const ordered = [
    ...assets.filter((asset) => asset.isPrimary),
    ...assets.filter((asset) => !asset.isPrimary),
  ];
  return ordered.map((asset) => media.urlFor(asset.id, 'web'));
}

export function propertyPublicRouter(repo: PropertyRepo, media?: MediaService): Router {
  const router = Router();

  router.get(
    '/properties',
    withValidation(
      { query: propertyListQuerySchema.and(localeQuery) },
      async ({ query }, _req, res) => {
        const { items, total } = await repo.getPage(query);
        const locale = localeFrom(query.lang);
        // List cards use denormalized cover only — no per-row media queries.
        const data = items.map((row) => serializePropertyListItem(row, locale));
        res.json({
          data,
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
        res.json({
          data: serializeProperty(row, localeFrom(query.lang), {
            imageUrls: await imageUrlsFor(media, row),
          }),
        });
      },
    ),
  );

  router.get(
    '/properties/:slug/similar',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const row = await repo.getBySlug(params.slug);
        if (row === undefined) throw new AppError('NOT_FOUND');
        const locale = localeFrom(query.lang);
        const items = await repo.findSimilar(row);
        const data = items.map((item) => serializePropertyListItem(item, locale));
        res.json({ data });
      },
    ),
  );

  return router;
}
