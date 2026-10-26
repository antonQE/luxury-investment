import { SELLER_HANDBOOK_SLUG } from '@luxury-investment/shared';
import { eq } from 'drizzle-orm';

import { documents, documentVersions, translations } from '../schema.ts';
import type { SeedModule } from './index.ts';

async function writeTranslation(
  db: Parameters<SeedModule['run']>[0],
  entityType: string,
  entityId: string,
  field: string,
  locale: string,
  value: string,
) {
  await db
    .insert(translations)
    .values({ entityType, entityId, locale, field, value })
    .onConflictDoUpdate({
      target: [
        translations.entityType,
        translations.entityId,
        translations.locale,
        translations.field,
      ],
      set: { value },
    });
}

/** Tiny valid PDF (one blank page) for local download demos. */
const DEMO_PDF_STORAGE_KEY = 'documents/seller-handbook/demo-v1.pdf';

export const documentsSeed: SeedModule = {
  name: 'documents',
  async run(db) {
    const [existing] = await db
      .select({ id: documents.id, currentVersionId: documents.currentVersionId })
      .from(documents)
      .where(eq(documents.slug, SELLER_HANDBOOK_SLUG))
      .limit(1);

    let documentId = existing?.id;
    if (documentId === undefined) {
      const [inserted] = await db
        .insert(documents)
        .values({
          slug: SELLER_HANDBOOK_SLUG,
          kind: 'seller_handbook',
          accessLevel: 'public',
        })
        .returning({ id: documents.id });
      documentId = inserted?.id;
    } else {
      await db
        .update(documents)
        .set({
          kind: 'seller_handbook',
          accessLevel: 'public',
          updatedAt: new Date(),
        })
        .where(eq(documents.id, documentId));
    }
    if (documentId === undefined) return;

    await writeTranslation(
      db,
      'document',
      documentId,
      'title',
      'bg',
      'Наръчник на продавача (демо)',
    );
    await writeTranslation(db, 'document', documentId, 'title', 'en', 'Seller handbook (demo)');

    const [versionExisting] = await db
      .select({ id: documentVersions.id })
      .from(documentVersions)
      .where(eq(documentVersions.storageKey, DEMO_PDF_STORAGE_KEY))
      .limit(1);

    let versionId = versionExisting?.id;
    if (versionId === undefined) {
      const [version] = await db
        .insert(documentVersions)
        .values({
          documentId,
          versionLabel: '2026.1-demo',
          storageKey: DEMO_PDF_STORAGE_KEY,
          fileName: 'seller-handbook-demo.pdf',
          contentType: 'application/pdf',
          byteSize: 0,
          publishedAt: new Date('2026-01-01T10:00:00.000Z'),
        })
        .returning({ id: documentVersions.id });
      versionId = version?.id;
    }

    if (versionId !== undefined && existing?.currentVersionId !== versionId) {
      await db
        .update(documents)
        .set({ currentVersionId: versionId, updatedAt: new Date() })
        .where(eq(documents.id, documentId));
    }
  },
};
