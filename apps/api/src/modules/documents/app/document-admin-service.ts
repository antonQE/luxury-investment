import { randomUUID } from 'node:crypto';

import type {
  CreateDocumentInput,
  ListDocumentsQuery,
  UpdateDocumentInput,
} from '@luxury-investment/shared';
import { SELLER_HANDBOOK_SLUG } from '@luxury-investment/shared';
import { and, asc, count, desc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import {
  documents,
  documentVersions,
  downloadEvents,
  translations,
} from '../../../infrastructure/db/schema.ts';
import type { StoragePort } from '../../media/storage/storage-port.ts';

const MAX_PDF_BYTES = 20 * 1024 * 1024;

async function writeTranslation(
  db: Database,
  entityId: string,
  field: string,
  locale: string,
  value: string,
) {
  await db
    .insert(translations)
    .values({ entityType: 'document', entityId, locale, field, value })
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

export class DocumentAdminService {
  readonly #db: Database;
  readonly #storage: StoragePort;

  constructor(db: Database, storage: StoragePort) {
    this.#db = db;
    this.#storage = storage;
  }

  async listDocuments(query: ListDocumentsQuery) {
    const clauses = [];
    if (!query.includeArchived) clauses.push(isNull(documents.archivedAt));
    if (query.kind !== undefined) clauses.push(eq(documents.kind, query.kind));
    const where = clauses.length > 0 ? and(...clauses) : undefined;

    const rows = await this.#db
      .select()
      .from(documents)
      .where(where)
      .orderBy(asc(documents.kind), asc(documents.slug));

    const ids = rows.map((row) => row.id);
    const labels = await this.#loadLabels(ids);

    return rows.map((row) => {
      const t = labels.get(row.id) ?? {};
      return {
        id: row.id,
        slug: row.slug,
        kind: row.kind,
        accessLevel: row.accessLevel,
        locale: row.locale,
        source: row.source,
        legalSample: row.legalSample,
        responsibleEditor: row.responsibleEditor,
        currentVersionId: row.currentVersionId,
        archivedAt: row.archivedAt,
        titleBg: t.titleBg ?? '',
        titleEn: t.titleEn ?? '',
        descriptionBg: t.descriptionBg ?? '',
        descriptionEn: t.descriptionEn ?? '',
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      };
    });
  }

  async getDocument(id: string) {
    const [doc] = await this.#db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');
    return this.#detailFor(doc);
  }

  async getSellerHandbook() {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.slug, SELLER_HANDBOOK_SLUG), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');
    return this.#detailFor(doc);
  }

  async createDocument(input: CreateDocumentInput) {
    const [existing] = await this.#db
      .select({ id: documents.id })
      .from(documents)
      .where(eq(documents.slug, input.slug))
      .limit(1);
    if (existing !== undefined) throw new AppError('CONFLICT', 'Document slug already exists.');

    const [inserted] = await this.#db
      .insert(documents)
      .values({
        slug: input.slug,
        kind: input.kind,
        accessLevel: input.accessLevel,
        locale: input.locale,
        source: input.source,
        legalSample: input.legalSample,
        responsibleEditor: input.responsibleEditor,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');

    await writeTranslation(this.#db, inserted.id, 'title', 'bg', input.titleBg);
    await writeTranslation(this.#db, inserted.id, 'title', 'en', input.titleEn);
    await writeTranslation(this.#db, inserted.id, 'description', 'bg', input.descriptionBg);
    await writeTranslation(this.#db, inserted.id, 'description', 'en', input.descriptionEn);

    return this.#detailFor(inserted);
  }

  async updateDocument(id: string, input: UpdateDocumentInput) {
    const [existing] = await this.#db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (existing === undefined) throw new AppError('NOT_FOUND');

    const [updated] = await this.#db
      .update(documents)
      .set({
        kind: input.kind ?? existing.kind,
        accessLevel: input.accessLevel ?? existing.accessLevel,
        locale: input.locale ?? existing.locale,
        source: input.source ?? existing.source,
        legalSample: input.legalSample ?? existing.legalSample,
        responsibleEditor: input.responsibleEditor ?? existing.responsibleEditor,
        updatedAt: new Date(),
      })
      .where(eq(documents.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');

    if (input.titleBg !== undefined) {
      await writeTranslation(this.#db, id, 'title', 'bg', input.titleBg);
    }
    if (input.titleEn !== undefined) {
      await writeTranslation(this.#db, id, 'title', 'en', input.titleEn);
    }
    if (input.descriptionBg !== undefined) {
      await writeTranslation(this.#db, id, 'description', 'bg', input.descriptionBg);
    }
    if (input.descriptionEn !== undefined) {
      await writeTranslation(this.#db, id, 'description', 'en', input.descriptionEn);
    }

    return this.#detailFor(updated);
  }

  async archiveDocument(id: string) {
    const [existing] = await this.#db.select().from(documents).where(eq(documents.id, id)).limit(1);
    if (existing === undefined) throw new AppError('NOT_FOUND');
    if (existing.archivedAt !== null) return this.#detailFor(existing);

    const [updated] = await this.#db
      .update(documents)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');
    return this.#detailFor(updated);
  }

  async uploadVersion(
    documentId: string,
    input: {
      versionLabel: string;
      fileName: string;
      contentType: string;
      body: Buffer;
      publish: boolean;
    },
  ) {
    if (input.contentType !== 'application/pdf') {
      throw new AppError('VALIDATION_FAILED', 'Only PDF uploads are allowed.');
    }
    if (input.body.byteLength === 0 || input.body.byteLength > MAX_PDF_BYTES) {
      throw new AppError('VALIDATION_FAILED', 'PDF size is invalid.');
    }

    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');

    const key = `documents/${doc.slug}/${randomUUID()}.pdf`;
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

  async publishVersion(documentId: string, versionId: string) {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.id, documentId), isNull(documents.archivedAt)))
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

  async uploadSellerHandbookVersion(input: {
    versionLabel: string;
    fileName: string;
    contentType: string;
    body: Buffer;
    publish: boolean;
  }) {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.slug, SELLER_HANDBOOK_SLUG), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');
    return this.uploadVersion(doc.id, input);
  }

  async publishSellerHandbookVersion(versionId: string) {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.slug, SELLER_HANDBOOK_SLUG), isNull(documents.archivedAt)))
      .limit(1);
    if (doc === undefined) throw new AppError('NOT_FOUND');
    return this.publishVersion(doc.id, versionId);
  }

  async #detailFor(doc: typeof documents.$inferSelect) {
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
    const labels = await this.#loadLabels([doc.id]);
    const t = labels.get(doc.id) ?? {};

    return {
      id: doc.id,
      slug: doc.slug,
      kind: doc.kind,
      accessLevel: doc.accessLevel,
      locale: doc.locale,
      source: doc.source,
      legalSample: doc.legalSample,
      responsibleEditor: doc.responsibleEditor,
      currentVersionId: doc.currentVersionId,
      archivedAt: doc.archivedAt,
      titleBg: t.titleBg ?? '',
      titleEn: t.titleEn ?? '',
      descriptionBg: t.descriptionBg ?? '',
      descriptionEn: t.descriptionEn ?? '',
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
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async #loadLabels(ids: string[]) {
    const map = new Map<
      string,
      { titleBg?: string; titleEn?: string; descriptionBg?: string; descriptionEn?: string }
    >();
    for (const id of ids) map.set(id, {});
    if (ids.length === 0) return map;

    const rows = await this.#db
      .select()
      .from(translations)
      .where(and(eq(translations.entityType, 'document'), inArray(translations.entityId, ids)));

    for (const row of rows) {
      const current = map.get(row.entityId) ?? {};
      if (row.field === 'title' && row.locale === 'bg') current.titleBg = row.value;
      if (row.field === 'title' && row.locale === 'en') current.titleEn = row.value;
      if (row.field === 'description' && row.locale === 'bg') current.descriptionBg = row.value;
      if (row.field === 'description' && row.locale === 'en') current.descriptionEn = row.value;
      map.set(row.entityId, current);
    }
    return map;
  }
}
