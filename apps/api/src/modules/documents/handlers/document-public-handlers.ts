import { SELLER_HANDBOOK_SLUG } from '@luxury-investment/shared';
import { type Response, Router } from 'express';
import { z } from 'zod';

import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { DocumentPublicService } from '../app/document-public-service.ts';

const slugParams = z.object({ slug: z.string().min(1) });
const downloadQuery = z.object({
  source: z.string().max(120).optional(),
});

export function documentPublicRouter(docs: DocumentPublicService): Router {
  const router = Router();

  async function sendDownload(
    slug: string,
    source: string | undefined,
    referrer: string | undefined,
    res: Response,
  ) {
    const file = await docs.downloadPublished(slug, { source, referrer });
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(file.body);
  }

  router.get(
    '/documents/:slug',
    withValidation(
      { params: slugParams, query: downloadQuery },
      async ({ params, query }, req, res) => {
        const slug = params.slug === 'seller-handbook' ? SELLER_HANDBOOK_SLUG : params.slug;
        const referer = req.get('referer');
        await sendDownload(
          slug,
          query.source,
          typeof referer === 'string' ? referer : undefined,
          res,
        );
      },
    ),
  );

  return router;
}
