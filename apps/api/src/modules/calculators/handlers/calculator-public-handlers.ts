import { acquisitionEstimateQuerySchema, localeSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { AcquisitionEstimateService } from '../app/acquisition-estimate-service.ts';

const slugParams = z.object({ slug: z.string().min(1).max(200) });
const querySchema = acquisitionEstimateQuerySchema.extend({
  lang: localeSchema.optional().default('en'),
});

export function calculatorPublicRouter(service: AcquisitionEstimateService): Router {
  const router = Router();

  router.get(
    '/properties/:slug/acquisition-estimate',
    withValidation(
      { params: slugParams, query: querySchema },
      async ({ params, query }, _req, res) => {
        const estimate = await service.estimateForSlug(params.slug, {
          price: query.price,
          locale: query.lang,
        });
        if (estimate === null) throw new AppError('NOT_FOUND');
        res.json({ data: estimate });
      },
    ),
  );

  return router;
}
