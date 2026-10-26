import { Router } from 'express';
import { z } from 'zod';

import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { MediaService } from '../app/media-service.ts';

const params = z.object({
  assetId: z.uuid(),
  variant: z.enum(['original', 'web', 'thumb', 'social']),
});

export function mediaPublicRouter(media: MediaService): Router {
  const router = Router();

  router.get(
    '/media/:assetId/:variant',
    withValidation({ params }, async ({ params: p }, _req, res) => {
      const { body, contentType } = await media.readPublicVariant(p.assetId, p.variant);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.send(body);
    }),
  );

  return router;
}
