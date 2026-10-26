import { DEFAULT_LOCALE, localeSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { TeamPublicService } from '../app/team-public-service.ts';

const localeQuery = z.object({ lang: localeSchema.optional() });
const slugParams = z.object({ slug: z.string().min(1) });

export function teamPublicRouter(team: TeamPublicService): Router {
  const router = Router();

  router.get(
    '/team',
    withValidation({ query: localeQuery }, async ({ query }, _req, res) => {
      const data = await team.listMembers(query.lang ?? DEFAULT_LOCALE);
      res.json({ data });
    }),
  );

  router.get(
    '/team/:slug',
    withValidation(
      { params: slugParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const data = await team.getMember(query.lang ?? DEFAULT_LOCALE, params.slug);
        res.json({ data });
      },
    ),
  );

  router.get(
    '/offices',
    withValidation({ query: localeQuery }, async ({ query }, _req, res) => {
      const data = await team.listOffices(query.lang ?? DEFAULT_LOCALE);
      res.json({ data });
    }),
  );

  router.get(
    '/partners',
    withValidation({ query: localeQuery }, async ({ query }, _req, res) => {
      const data = await team.listPartners(query.lang ?? DEFAULT_LOCALE);
      res.json({ data });
    }),
  );

  return router;
}
