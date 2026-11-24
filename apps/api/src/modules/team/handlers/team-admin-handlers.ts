import { marketSchema, teamMemberKindSchema } from '@luxury-investment/shared';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';

import { AppError } from '../../../errors/app-error.ts';
import { withValidation } from '../../../infrastructure/server/middleware/validate.ts';
import type { TeamAdminService, TeamMemberDetail } from '../app/team-admin-service.ts';

const idParams = z.object({ id: z.uuid() });

const emptyToNull = (value: unknown) =>
  value === '' || value === null || value === undefined ? null : value;

/** Accept absolute http(s) URLs; empty → null. */
const optionalPhotoUrl = z.preprocess(
  emptyToNull,
  z
    .string()
    .max(2000)
    .refine((value) => /^https?:\/\//i.test(value), 'Must be an http(s) URL')
    .nullable()
    .optional(),
);

const memberBody = z.object({
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
  email: z.preprocess(emptyToNull, z.email().nullable().optional()),
  phone: z.preprocess(emptyToNull, z.string().nullable().optional()),
  photoUrl: optionalPhotoUrl,
  markets: z.array(marketSchema).optional(),
  languages: z.array(z.string().trim().min(1).max(16)).optional(),
  qualifications: z.preprocess(emptyToNull, z.string().nullable().optional()),
  sortOrder: z.preprocess(
    (value) => (value === undefined || value === null || value === '' ? 0 : value),
    z.coerce.number().int(),
  ),
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

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
});

function requireContent(
  permission: 'content:read' | 'content:write',
  permissions: string[] | undefined,
) {
  if (permissions?.includes(permission) !== true) throw new AppError('FORBIDDEN');
}

function serializeMember(row: TeamMemberDetail) {
  return {
    id: row.id,
    slug: row.slug,
    kind: row.kind,
    nameBg: row.nameBg,
    nameEn: row.nameEn,
    roleBg: row.roleBg,
    roleEn: row.roleEn,
    bioBg: row.bioBg,
    bioEn: row.bioEn,
    email: row.email,
    phone: row.phone,
    photoUrl: row.photoUrl,
    markets: row.markets,
    languages: row.languages,
    qualifications: row.qualifications,
    sortOrder: row.sortOrder,
    isPublic: row.isPublic,
  };
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
        photoUrl: row.photoUrl,
        isPublic: row.isPublic,
        sortOrder: row.sortOrder,
      })),
    });
  });

  router.get(
    '/team/:id',
    withValidation({ params: idParams }, async ({ params }, req, res) => {
      requireContent('content:read', req.auth?.permissions);
      const row = await admin.getTeamMember(params.id);
      res.json({ data: serializeMember(row) });
    }),
  );

  router.post(
    '/team',
    withValidation({ body: memberBody }, async ({ body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.createTeamMember(body);
      res.status(201).json({ data: { id: row.id, slug: row.slug } });
    }),
  );

  router.patch(
    '/team/:id',
    withValidation({ params: idParams, body: memberBody }, async ({ params, body }, req, res) => {
      requireContent('content:write', req.auth?.permissions);
      const row = await admin.updateTeamMember(params.id, body);
      res.json({ data: serializeMember(row) });
    }),
  );

  router.post('/team/:id/photo', (req, res, next) => {
    upload.single('file')(req, res, (err: unknown) => {
      if (err !== undefined) {
        next(err);
        return;
      }
      void (async () => {
        try {
          requireContent('content:write', req.auth?.permissions);
          const params = idParams.parse(req.params);
          const file = req.file;
          if (file === undefined) throw new AppError('VALIDATION_FAILED', 'file required');
          const row = await admin.uploadTeamPhoto(params.id, {
            buffer: file.buffer,
            mimetype: file.mimetype,
          });
          res.json({ data: serializeMember(row) });
        } catch (error) {
          next(error);
        }
      })();
    });
  });

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
