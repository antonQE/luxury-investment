import { Router } from 'express';

import { AppError } from '../../../errors/app-error.ts';
import type { AuditService } from '../app/audit-service.ts';

export function auditAdminRouter(audit: AuditService): Router {
  const router = Router();

  router.get('/audit', async (req, res) => {
    if (!req.auth?.permissions.includes('audit:read')) {
      throw new AppError('FORBIDDEN');
    }
    const entries = await audit.listRecent(50);
    res.json({
      data: entries.map((row) => ({
        id: row.id,
        actorUserId: row.actorUserId,
        actorEmail: row.actorEmail,
        action: row.action,
        resourceType: row.resourceType,
        resourceId: row.resourceId,
        metadata: row.metadata,
        createdAt: row.createdAt.toISOString(),
      })),
    });
  });

  return router;
}
