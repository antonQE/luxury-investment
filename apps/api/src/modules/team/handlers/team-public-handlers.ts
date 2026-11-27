import { DEFAULT_LOCALE, localeSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { TeamAdminService } from '../app/team-admin-service.ts';
import type { TeamPublicService } from '../app/team-public-service.ts';

const localeQuery = z.object({ lang: localeSchema.optional() });
const slugParams = z.object({ slug: z.string().min(1) });
const idParams = z.object({ id: z.string().min(1) });
const photoParams = z.object({
  memberId: z.uuid(),
  fileName: z.string().min(1).max(120),
});

export function teamPublicRouter(
  team: TeamPublicService,
  photoSource?: Pick<TeamAdminService, 'readTeamPhotoObject'>,
): Router {
  const router = Router();

  router.get(
    '/team-media/:memberId/:fileName',
    withValidation({ params: photoParams }, async ({ params }, _req, res) => {
      if (photoSource === undefined) throw new AppError('NOT_FOUND');
      const file = await photoSource.readTeamPhotoObject(params.memberId, params.fileName);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.type(file.contentType).send(file.body);
    }),
  );

  router.get(
    '/team',
    withValidation({ query: localeQuery }, async ({ query }, _req, res) => {
      const data = await team.listMembers(query.lang ?? DEFAULT_LOCALE);
      res.json({ data });
    }),
  );

  router.get(
    '/team/by-id/:id',
    withValidation(
      { params: idParams, query: localeQuery },
      async ({ params, query }, _req, res) => {
        const data = await team.getMemberById(query.lang ?? DEFAULT_LOCALE, params.id);
        res.json({ data });
      },
    ),
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
