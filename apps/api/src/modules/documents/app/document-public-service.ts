import { and, eq, isNull } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { documents, documentVersions, downloadEvents } from '../../../infrastructure/db/schema.ts';
import type { StoragePort } from '../../media/storage/storage-port.ts';

export interface HandbookDownload {
  body: Buffer;
  contentType: string;
  fileName: string;
  documentId: string;
  versionId: string;
}

export class DocumentPublicService {
  readonly #db: Database;
  readonly #storage: StoragePort;

  constructor(db: Database, storage: StoragePort) {
    this.#db = db;
    this.#storage = storage;
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
