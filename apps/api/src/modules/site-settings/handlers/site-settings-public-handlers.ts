import { Router } from 'express';

import type { SiteSettingsService } from '../app/site-settings-service.ts';

export function siteSettingsPublicRouter(service: SiteSettingsService): Router {
  const router = Router();

  router.get('/site-settings', async (_req, res) => {
    const data = await service.getPublic();
    res.json({ data });
  });

  return router;
}
