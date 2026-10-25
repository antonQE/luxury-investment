import { DEFAULT_LOCALE, LOCALES } from '@luxury-investment/shared';
import { Router } from 'express';

export function metaRouter(): Router {
  const router = Router();

  router.get('/meta', (_req, res) => {
    res.json({ data: { locales: LOCALES, defaultLocale: DEFAULT_LOCALE } });
  });

  return router;
}
