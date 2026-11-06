import { updateSiteSettingsSchema } from '@luxury-investment/shared';
import { Router } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { SiteSettingsService } from '../app/site-settings-service.ts';

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function siteSettingsAdminRouter(service: SiteSettingsService): Router {
  const router = Router();

  router.get('/site-settings', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const data = await service.getPublic();
    res.json({ data });
  });

  router.patch(
    '/site-settings',
    withValidation({ body: updateSiteSettingsSchema }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const data = await service.update(body);
      res.json({ data });
    }),
  );

  return router;
}
