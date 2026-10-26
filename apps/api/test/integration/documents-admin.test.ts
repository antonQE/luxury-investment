import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { pino } from 'pino';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it } from 'vitest';

import { createApp } from '../../src/app.ts';
import { SEED_MODULES } from '../../src/infrastructure/db/seeds/index.ts';
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from '../../src/infrastructure/db/seeds/users.ts';
import { DocumentAdminService } from '../../src/modules/documents/app/document-admin-service.ts';
import { DocumentPublicService } from '../../src/modules/documents/app/document-public-service.ts';
import { DEMO_PDF_BYTES } from '../../src/modules/documents/demo-pdf.ts';
import { documentAdminRouter } from '../../src/modules/documents/handlers/document-admin-handlers.ts';
import { documentPublicRouter } from '../../src/modules/documents/handlers/document-public-handlers.ts';
import { LocalStorage } from '../../src/modules/media/storage/local-storage.ts';
import { AuthService } from '../../src/modules/users/app/auth-service.ts';
import { mountAdminAuth } from '../../src/modules/users/handlers/auth-handlers.ts';
import { UserRepo } from '../../src/modules/users/repo/user-repo.ts';
import { connectTestDatabase, resetDatabase } from '../helpers/database.ts';

const connection = connectTestDatabase();
const logger = pino({ level: 'silent' });

const env = {
  NODE_ENV: 'test' as const,
  API_CORS_ORIGINS: ['http://localhost:5173'],
  API_ADMIN_CORS_ORIGINS: ['http://localhost:5173'],
  AUTH_SESSION_SECRET: 'test-session-secret-32',
  AUTH_COOKIE_NAME: 'li_session',
  AUTH_SESSION_TTL_HOURS: 24,
};

let mediaRoot = '';

function buildApp() {
  const storage = new LocalStorage(mediaRoot, 'http://localhost:4000/v1/public/media');
  const auth = new AuthService(
    new UserRepo(connection.db),
    env.AUTH_SESSION_TTL_HOURS,
    env.AUTH_SESSION_SECRET,
  );
  const mounted = mountAdminAuth(auth, env);
  return createApp({
    env,
    logger,
    adminPublicRouters: [mounted.publicRouter],
    adminAuthGate: mounted.gate,
    adminRouters: [
      mounted.protectedRouter,
      documentAdminRouter(new DocumentAdminService(connection.db, storage)),
    ],
  });
}

async function loginAgent() {
  const agent = request.agent(buildApp());
  await agent
    .post('/v1/admin/auth/login')
    .send({ email: DEMO_ADMIN_EMAIL, password: DEMO_ADMIN_PASSWORD })
    .expect(200);
  return agent;
}

beforeEach(async () => {
  await resetDatabase(connection);
  if (mediaRoot !== '') {
    await rm(mediaRoot, { recursive: true, force: true });
  }
  mediaRoot = await mkdtemp(path.join(tmpdir(), 'li-docs-admin-'));
  process.env.MEDIA_LOCAL_ROOT = mediaRoot;
  for (const module of SEED_MODULES) {
    await module.run(connection.db);
  }
});

afterAll(async () => {
  if (mediaRoot !== '') {
    await rm(mediaRoot, { recursive: true, force: true });
  }
  await connection.close();
});

describe('admin seller handbook API', () => {
  it('lists handbook, uploads a new version and publishes it', async () => {
    const agent = await loginAgent();
    const list = await agent.get('/v1/admin/documents/seller-handbook').expect(200);
    expect(
      (list.body as { data: { versions: unknown[]; downloadTotal: number } }).data.versions.length,
    ).toBeGreaterThan(0);

    const uploaded = await agent
      .post('/v1/admin/documents/seller-handbook/versions')
      .field('versionLabel', '2026.2-test')
      .field('publish', 'true')
      .attach('file', DEMO_PDF_BYTES, {
        filename: 'handbook-new.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const id = (uploaded.body as { data: { id: string } }).data.id;
    expect(id).toBeTruthy();

    const after = await agent.get('/v1/admin/documents/seller-handbook').expect(200);
    expect((after.body as { data: { currentVersionId: string } }).data.currentVersionId).toBe(id);
  });
});

describe('admin document download stats', () => {
  it('sums successful downloads across versions for a date range', async () => {
    const agent = await loginAgent();
    const handbook = await agent.get('/v1/admin/documents/seller-handbook').expect(200);
    const docId = (handbook.body as { data: { id: string; versions: { id: string }[] } }).data.id;
    const versionA = (handbook.body as { data: { versions: { id: string }[] } }).data.versions[0]
      ?.id;
    expect(versionA).toBeTruthy();

    const storage = new LocalStorage(mediaRoot, 'http://localhost:4000/v1/public/media');
    const publicApp = createApp({
      env,
      logger,
      publicRouters: [documentPublicRouter(new DocumentPublicService(connection.db, storage))],
    });

    await request(publicApp)
      .get('/v1/public/documents/seller-handbook')
      .query({ source: 'stats-a' })
      .expect(200);
    await request(publicApp)
      .get('/v1/public/documents/seller-handbook')
      .query({ source: 'stats-b' })
      .expect(200);

    const uploaded = await agent
      .post(`/v1/admin/documents/${docId}/versions`)
      .field('versionLabel', 'stats-v2')
      .field('publish', 'true')
      .attach('file', DEMO_PDF_BYTES, {
        filename: 'handbook-stats.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);
    expect((uploaded.body as { data: { id: string } }).data.id).toBeTruthy();

    await request(publicApp)
      .get('/v1/public/documents/seller-handbook')
      .query({ source: 'stats-a' })
      .expect(200);

    const stats = await agent
      .get(`/v1/admin/documents/${docId}/download-stats`)
      .query({ from: '2020-01-01T00:00:00.000Z' })
      .expect(200);

    const body = stats.body as {
      data: {
        successTotal: number;
        attemptTotal: number;
        byVersion: { versionId: string; total: number }[];
        bySource: { source: string | null; total: number }[];
      };
    };

    expect(body.data.successTotal).toBe(3);
    expect(body.data.attemptTotal).toBe(3);
    expect(body.data.byVersion.reduce((sum, row) => sum + row.total, 0)).toBe(3);
    expect(body.data.bySource.some((row) => row.source === 'stats-a' && row.total === 2)).toBe(
      true,
    );
  });
});

describe('admin document library API', () => {
  it('creates a document, uploads a version, sets current, and archives', async () => {
    const agent = await loginAgent();

    const created = await agent
      .post('/v1/admin/documents')
      .send({
        slug: 'demo-declaration',
        kind: 'declaration',
        accessLevel: 'public',
        locale: 'bg',
        legalSample: true,
        titleBg: 'Демо декларация',
        titleEn: 'Demo declaration',
        descriptionBg: 'Примерен текст',
        descriptionEn: 'Sample text',
      })
      .expect(201);

    const docId = (created.body as { data: { id: string; legalSample: boolean } }).data.id;
    expect((created.body as { data: { legalSample: boolean } }).data.legalSample).toBe(true);

    const uploaded = await agent
      .post(`/v1/admin/documents/${docId}/versions`)
      .field('versionLabel', '2026.1')
      .field('publish', 'false')
      .attach('file', DEMO_PDF_BYTES, {
        filename: 'declaration.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    const versionId = (uploaded.body as { data: { id: string } }).data.id;

    await agent.post(`/v1/admin/documents/${docId}/versions/${versionId}/publish`).expect(200);

    const detail = await agent.get(`/v1/admin/documents/${docId}`).expect(200);
    expect((detail.body as { data: { currentVersionId: string } }).data.currentVersionId).toBe(
      versionId,
    );
    expect((detail.body as { data: { downloadTotal: number } }).data.downloadTotal).toBe(0);

    await agent.post(`/v1/admin/documents/${docId}/archive`).expect(200);

    const listed = await agent.get('/v1/admin/documents').expect(200);
    const active = (listed.body as { data: { id: string }[] }).data;
    expect(active.some((row) => row.id === docId)).toBe(false);

    const withArchived = await agent
      .get('/v1/admin/documents')
      .query({ includeArchived: 'true' })
      .expect(200);
    expect(
      (withArchived.body as { data: { id: string; archivedAt: string | null }[] }).data.some(
        (row) => row.id === docId && row.archivedAt !== null,
      ),
    ).toBe(true);
  });
});
