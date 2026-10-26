import { teamMemberKindSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { TeamAdminService } from '../app/team-admin-service.ts';

const idParams = z.object({ id: z.uuid() });

const createMemberBody = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  kind: teamMemberKindSchema,
  nameBg: z.string().min(1),
  nameEn: z.string().min(1),
  roleBg: z.string().min(1),
  roleEn: z.string().min(1),
  bioBg: z.string().optional(),
  bioEn: z.string().optional(),
  email: z.email().nullable().optional(),
  phone: z.string().nullable().optional(),
  photoUrl: z.url().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isPublic: z.boolean().optional(),
});

const createOfficeBody = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameBg: z.string().min(1),
  nameEn: z.string().min(1),
  addressBg: z.string().min(1),
  addressEn: z.string().min(1),
  mapQuery: z.string().min(1),
  phone: z.string().nullable().optional(),
  email: z.email().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

const createPartnerBody = z.object({
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameBg: z.string().min(1),
  nameEn: z.string().min(1),
  logoUrl: z.url(),
  websiteUrl: z.url().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

export function teamAdminRouter(admin: TeamAdminService): Router {
  const router = Router();

  router.get('/team', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const rows = await admin.listTeam();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        kind: row.kind,
        name: row.name,
        email: row.email,
        phone: row.phone,
        isPublic: row.isPublic,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.post(
    '/team',
    withValidation({ body: createMemberBody }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.createTeamMember(body);
      res.status(201).json({ data: { id: row.id, slug: row.slug } });
    }),
  );

  router.post(
    '/team/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.archiveTeamMember(params.id);
      res.json({ data: { id: row.id, archivedAt: row.archivedAt?.toISOString() ?? null } });
    }),
  );

  router.get('/offices', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const rows = await admin.listOffices();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        mapQuery: row.mapQuery,
        phone: row.phone,
        email: row.email,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.post(
    '/offices',
    withValidation({ body: createOfficeBody }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.createOffice(body);
      res.status(201).json({ data: { id: row.id, slug: row.slug } });
    }),
  );

  router.post(
    '/offices/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.archiveOffice(params.id);
      res.json({ data: { id: row.id, archivedAt: row.archivedAt?.toISOString() ?? null } });
    }),
  );

  router.get('/partners', async (req, res) => {
    requireContent('content:read', req.auth?.permissions);
    const rows = await admin.listPartners();
    res.json({
      data: rows.map((row) => ({
        id: row.id,
        slug: row.slug,
        name: row.name,
        logoUrl: row.logoUrl,
        websiteUrl: row.websiteUrl,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.post(
    '/partners',
    withValidation({ body: createPartnerBody }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.createPartner(body);
      res.status(201).json({ data: { id: row.id, slug: row.slug } });
    }),
  );

  router.post(
    '/partners/:id/archive',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.archivePartner(params.id);
      res.json({ data: { id: row.id, archivedAt: row.archivedAt?.toISOString() ?? null } });
    }),
  );

  return router;
}
