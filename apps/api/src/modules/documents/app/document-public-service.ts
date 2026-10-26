import type { Locale } from '@luxury-investment/shared';
import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import {
  documents,
  documentVersions,
  downloadEvents,
  translations,
} from '../../../infrastructure/db/schema.ts';
import type { StoragePort } from '../../media/storage/storage-port.ts';

export interface HandbookDownload {
  body: Buffer;
  contentType: string;
  fileName: string;
  documentId: string;
  versionId: string;
}

export interface PublicDocumentListItem {
  id: string;
  slug: string;
  kind: string;
  locale: string;
  legalSample: boolean;
  title: string;
  description: string;
  fileName: string | null;
  publishedAt: string | null;
}

export class DocumentPublicService {
  readonly #db: Database;
  readonly #storage: StoragePort;

  constructor(db: Database, storage: StoragePort) {
    this.#db = db;
    this.#storage = storage;
  }

  async listPublic(locale: Locale): Promise<PublicDocumentListItem[]> {
    const rows = await this.#db
      .select()
      .from(documents)
      .where(and(eq(documents.accessLevel, 'public'), isNull(documents.archivedAt)))
      .orderBy(asc(documents.kind), asc(documents.slug));

    const ids = rows.map((row) => row.id);
    const labels = new Map<string, { title?: string; description?: string }>();
    for (const id of ids) labels.set(id, {});

    if (ids.length > 0) {
      const translationRows = await this.#db
        .select()
        .from(translations)
        .where(and(eq(translations.entityType, 'document'), inArray(translations.entityId, ids)));
      for (const preferred of [locale, 'en'] as const) {
        for (const row of translationRows) {
          if (row.locale !== preferred) continue;
          const current = labels.get(row.entityId) ?? {};
          if (row.field === 'title' && current.title === undefined) current.title = row.value;
          if (row.field === 'description' && current.description === undefined) {
            current.description = row.value;
          }
          labels.set(row.entityId, current);
        }
      }
    }

    const versionIds = rows
      .map((row) => row.currentVersionId)
      .filter((id): id is string => id !== null);
    const versions =
      versionIds.length === 0
        ? []
        : await this.#db
            .select()
            .from(documentVersions)
            .where(inArray(documentVersions.id, versionIds));
    const versionById = new Map(versions.map((row) => [row.id, row]));

    const result: PublicDocumentListItem[] = [];
    for (const row of rows) {
      const version =
        row.currentVersionId === null ? undefined : versionById.get(row.currentVersionId);
      if (version === undefined || version.publishedAt === null) continue;
      const t = labels.get(row.id) ?? {};
      result.push({
        id: row.id,
        slug: row.slug,
        kind: row.kind,
        locale: row.locale,
        legalSample: row.legalSample,
        title: t.title ?? row.slug,
        description: t.description ?? '',
        fileName: version.fileName,
        publishedAt: version.publishedAt.toISOString(),
      });
    }
    return result;
  }

  async downloadPublished(
    slug: string,
    meta?: { source?: string; referrer?: string },
  ): Promise<HandbookDownload> {
    const [doc] = await this.#db
      .select()
      .from(documents)
      .where(
        and(
          eq(documents.slug, slug),
          eq(documents.accessLevel, 'public'),
          isNull(documents.archivedAt),
        ),
      )
      .limit(1);
    if (doc === undefined || doc.currentVersionId === null) {
      throw new AppError('NOT_FOUND');
    }

    const [version] = await this.#db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.id, doc.currentVersionId))
      .limit(1);
    if (version === undefined || version.publishedAt === null) {
      throw new AppError('NOT_FOUND');
    }

    let body: Buffer;
    try {
      body = await this.#storage.get(version.storageKey);
    } catch {
      throw new AppError('NOT_FOUND');
    }

    await this.#db.insert(downloadEvents).values({
      documentId: doc.id,
      versionId: version.id,
      success: true,
      source: meta?.source ?? null,
      referrer: meta?.referrer ?? null,
    });

    return {
      body,
      contentType: version.contentType,
      fileName: version.fileName,
      documentId: doc.id,
      versionId: version.id,
    };
  }
}
