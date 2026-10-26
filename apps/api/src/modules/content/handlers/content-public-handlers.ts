import { DEFAULT_LOCALE, localeSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { ContentPublicService } from '../app/content-public-service.ts';

const localeQuery = z.object({ lang: localeSchema.optional() });
const slugParams = z.object({ slug: z.string().min(1) });

export function contentPublicRouter(content: ContentPublicService): Router {
  const router = Router();

  router.get(
    '/articles',
    withValidation({ query: localeQuery }, async ({ query }, _req, res) => {
      const data = await content.listArticles(query.lang ?? DEFAULT_LOCALE);
      res.json({ data });
    }),
  );

  router.get(
    '/articles/:slug',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const data = await content.getArticle(query.lang ?? DEFAULT_LOCALE, params.slug);
        res.json({ data });
      },
    ),
  );

  router.get(
    '/pages/:slug',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const data = await content.getPage(query.lang ?? DEFAULT_LOCALE, params.slug);
        res.json({ data });
      },
    ),
  );

  return router;
}
