import {
  acquisitionEstimateQuerySchema,
  depositEstimateQuerySchema,
  localeSchema,
} from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { AcquisitionEstimateService } from '../app/acquisition-estimate-service.ts';
import type { DepositEstimateService } from '../app/deposit-estimate-service.ts';

const slugParams = z.object({ slug: z.string().min(1).max(200) });
const acquisitionQuery = acquisitionEstimateQuerySchema.extend({
  lang: localeSchema.optional().default('en'),
});
const depositQuery = depositEstimateQuerySchema.extend({
  lang: localeSchema.optional().default('en'),
});

export function calculatorPublicRouter(deps: {
  acquisition: AcquisitionEstimateService;
  deposit: DepositEstimateService;
}): Router {
  const router = Router();

  router.get(
    '/properties/:slug/acquisition-estimate',
    withValidation(
      { params: slugParams, query: acquisitionQuery },
      async ({ params, query }, _req, res) => {
        const estimate = await deps.acquisition.estimateForSlug(params.slug, {
          price: query.price,
          locale: query.lang,
        });
        if (estimate === null) throw new AppError('NOT_FOUND');
        res.json({ data: estimate });
      },
    ),
  );

  router.get(
    '/properties/:slug/deposit-estimate',
    withValidation(
      { params: slugParams, query: depositQuery },
      async ({ params, query }, _req, res) => {
        const estimate = await deps.deposit.estimateForSlug(params.slug, {
          price: query.price,
          depositPercent: query.depositPercent,
          locale: query.lang,
        });
        if (estimate === null) throw new AppError('NOT_FOUND');
        res.json({ data: estimate });
      },
    ),
  );

  return router;
}
