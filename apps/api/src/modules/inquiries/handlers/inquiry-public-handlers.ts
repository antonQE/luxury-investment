import { createInquirySchema } from '@luxury-investment/shared';
import { Router } from 'express';

import { createRateLimiter } from '../../../infrastructure/server/middleware/rate-limit.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { InquiryRepo } from '../repo/inquiry-repo.ts';

export function inquiryPublicRouter(repo: InquiryRepo): Router {
  const router = Router();
  const rateLimit = createRateLimiter({ windowMs: 60_000, max: 10 });

  router.post(
    '/inquiries',
    rateLimit,
    withValidation({ body: createInquirySchema }, async ({ body }, _req, res) => {
      // Honeypot already enforced by schema (`website` max length 0).
      const created = await repo.create(body);
      res.status(201).json({ data: { id: created.id } });
    }),
  );

  return router;
}
