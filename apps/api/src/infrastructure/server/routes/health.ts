import { Router } from 'express';

import packageJson from '../../../../package.json' with { type: 'json' };

export interface HealthCheck {
  name: string;
  check: () => Promise<boolean>;
}

export function healthRouter(checks: HealthCheck[] = []): Router {
  const router = Router();

  router.get('/health', async (_req, res) => {
    const results = await Promise.all(
      checks.map(async ({ name, check }) => {
        try {
          return [name, (await check()) ? 'up' : 'down'] as const;
        } catch {
          return [name, 'down'] as const;
        }
      }),
    );
    const components = Object.fromEntries(results);
    const healthy = results.every(([, state]) => state === 'up');
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'degraded',
      version: packageJson.version,
      components,
    });
  });

  return router;
}
