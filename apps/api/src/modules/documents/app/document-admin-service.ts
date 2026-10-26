import { randomUUID } from 'node:crypto';

import { SELLER_HANDBOOK_SLUG } from '@luxury-investment/shared';
import { and, count, desc, eq, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { documents, documentVersions, downloadEvents } from '../../../infrastructure/db/schema.ts';
import type { StoragePort } from '../../media/storage/storage-port.ts';

const MAX_PDF_BYTES = 20 * 1024 * 1024;

export class DocumentAdminService {
  readonly #db: Database;
  readonly #storage: StoragePort;

  constructor(db: Database, storage: StoragePort) {
    this.#db = db;
    this.#storage = storage;
  }

  async getSellerHandbook() {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.slug, SELLER_HANDBOOK_SLUG), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');

    const versions = await this.#db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, doc.id))
      .orderBy(desc(documentVersions.createdAt));

    const [totalRow] = await this.#db
      .select({ total: count() })
      .from(downloadEvents)
      .where(and(eq(downloadEvents.documentId, doc.id), eq(downloadEvents.success, true)));

    const perVersionRows = await this.#db
      .select({
        versionId: downloadEvents.versionId,
        total: count(),
      })
      .from(downloadEvents)
      .where(and(eq(downloadEvents.documentId, doc.id), eq(downloadEvents.success, true)))
      .groupBy(downloadEvents.versionId);

    const counts = new Map(perVersionRows.map((row) => [row.versionId, row.total]));

    return {
      id: doc.id,
      slug: doc.slug,
      kind: doc.kind,
      currentVersionId: doc.currentVersionId,
      downloadTotal: totalRow?.total ?? 0,
      versions: versions.map((version) => ({
        id: version.id,
        versionLabel: version.versionLabel,
        fileName: version.fileName,
        contentType: version.contentType,
        byteSize: version.byteSize,
        publishedAt: version.publishedAt,
        createdAt: version.createdAt,
        isCurrent: version.id === doc.currentVersionId,
        downloadCount: counts.get(version.id) ?? 0,
      })),
    };
  }

  async uploadSellerHandbookVersion(input: {
    versionLabel: string;
    fileName: string;
    contentType: string;
    body: Buffer;
    publish: boolean;
  }) {
    if (input.contentType !== 'application/pdf') {
      throw new AppError('VALIDATION_FAILED', 'Only PDF uploads are allowed.');
    }
    if (input.body.byteLength === 0 || input.body.byteLength > MAX_PDF_BYTES) {
      throw new AppError('VALIDATION_FAILED', 'PDF size is invalid.');
    }

    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.slug, SELLER_HANDBOOK_SLUG), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');

    const key = `documents/seller-handbook/${randomUUID()}.pdf`;
    await this.#storage.put({
      key,
      body: input.body,
      contentType: 'application/pdf',
    });

    const [version] = await this.#db
      .insert(documentVersions)
      .values({
        documentId: doc.id,
        versionLabel: input.versionLabel,
        storageKey: key,
        fileName: input.fileName,
        contentType: 'application/pdf',
        byteSize: input.body.byteLength,
        publishedAt: input.publish ? new Date() : null,
      })
      .returning();
    if (version === undefined) throw new AppError('INTERNAL');

    if (input.publish) {
      await this.#db
        .update(documents)
        .set({ currentVersionId: version.id, updatedAt: new Date() })
        .where(eq(documents.id, doc.id));
    }

    return version;
  }

  async publishSellerHandbookVersion(versionId: string) {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.slug, SELLER_HANDBOOK_SLUG), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');

    const [version] = await this.#db
      .select()
      .from(documentVersions)
      .where(and(eq(documentVersions.id, versionId), eq(documentVersions.documentId, doc.id)))
      .limit(1);
    if (version === undefined) throw new AppError('NOT_FOUND');

    await this.#db
      .update(documentVersions)
      .set({ publishedAt: version.publishedAt ?? new Date() })
      .where(eq(documentVersions.id, version.id));

    await this.#db
      .update(documents)
      .set({ currentVersionId: version.id, updatedAt: new Date() })
      .where(eq(documents.id, doc.id));

    return version;
  }
}
