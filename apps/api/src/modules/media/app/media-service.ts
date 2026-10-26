import { randomUUID } from 'node:crypto';

import { and, asc, eq, isNull, ne } from 'drizzle-orm';

import { AppError } from '../../../errors/app-error.ts';
import type { Database } from '../../../infrastructure/db/client.ts';
import { mediaAssets, properties } from '../../../infrastructure/db/schema.ts';
import type { StoragePort } from '../storage/storage-port.ts';
import { RenditionService } from './rendition-service.ts';

export type MediaAssetRow = typeof mediaAssets.$inferSelect;

export type MediaVariant = 'original' | 'web' | 'thumb' | 'social';

export class MediaService {
  readonly #db: Database;
  readonly #storage: StoragePort;
  readonly #renditions: RenditionService;
  readonly #publicBaseUrl: string;

  constructor(db: Database, storage: StoragePort, publicBaseUrl: string) {
    this.#db = db;
    this.#storage = storage;
    this.#renditions = new RenditionService(storage);
    this.#publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
  }

  urlFor(assetId: string, variant: MediaVariant): string {
    return `${this.#publicBaseUrl}/${assetId}/${variant}`;
  }

  async listForProperty(propertyId: string, includeArchived = false): Promise<MediaAssetRow[]> {
    const clauses = [eq(mediaAssets.propertyId, propertyId)];
    if (!includeArchived) clauses.push(isNull(mediaAssets.archivedAt));
    return this.#db
      .select()
      .from(mediaAssets)
      .where(and(...clauses))
      .orderBy(asc(mediaAssets.sortOrder), asc(mediaAssets.createdAt));
  }

  async listPublicForProperty(propertyId: string): Promise<MediaAssetRow[]> {
    return this.#db
      .select()
      .from(mediaAssets)
      .where(
        and(
          eq(mediaAssets.propertyId, propertyId),
          eq(mediaAssets.visibility, 'public'),
          isNull(mediaAssets.archivedAt),
        ),
      )
      .orderBy(asc(mediaAssets.sortOrder), asc(mediaAssets.createdAt));
  }

  async uploadImage(input: {
    propertyId: string;
    body: Buffer;
    mimeType: string;
    uploadedByUserId?: string;
    visibility?: string;
    altBg?: string;
    altEn?: string;
  }): Promise<MediaAssetRow> {
    const property = await this.#db
      .select({ id: properties.id })
      .from(properties)
      .where(eq(properties.id, input.propertyId))
      .limit(1);
    if (property.length === 0) throw new AppError('NOT_FOUND');

    const assetId = randomUUID();
    const processed = await this.#renditions.processImage({
      propertyId: input.propertyId,
      assetId,
      body: input.body,
      mimeType: input.mimeType,
    });

    const existing = await this.listForProperty(input.propertyId);
    const isPrimary = existing.length === 0;

    const [inserted] = await this.#db
      .insert(mediaAssets)
      .values({
        id: assetId,
        propertyId: input.propertyId,
        kind: 'image',
        visibility: input.visibility ?? 'public',
        mimeType: input.mimeType,
        byteSize: processed.byteSize,
        width: processed.width,
        height: processed.height,
        sortOrder: existing.length,
        isPrimary,
        altBg: input.altBg ?? '',
        altEn: input.altEn ?? '',
        renditions: processed.renditions,
        uploadedByUserId: input.uploadedByUserId ?? null,
      })
      .returning();
    if (inserted === undefined) throw new AppError('INTERNAL');
    return inserted;
  }

  async update(
    id: string,
    patch: {
      altBg?: string;
      altEn?: string;
      captionBg?: string;
      captionEn?: string;
      visibility?: string;
      sortOrder?: number;
      isPrimary?: boolean;
    },
  ): Promise<MediaAssetRow> {
    const [existing] = await this.#db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, id))
      .limit(1);
    if (existing === undefined) throw new AppError('NOT_FOUND');

    if (patch.isPrimary === true) {
      await this.#db
        .update(mediaAssets)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(and(eq(mediaAssets.propertyId, existing.propertyId), ne(mediaAssets.id, id)));
    }

    const [updated] = await this.#db
      .update(mediaAssets)
      .set({
        altBg: patch.altBg ?? existing.altBg,
        altEn: patch.altEn ?? existing.altEn,
        captionBg: patch.captionBg ?? existing.captionBg,
        captionEn: patch.captionEn ?? existing.captionEn,
        visibility: patch.visibility ?? existing.visibility,
        sortOrder: patch.sortOrder ?? existing.sortOrder,
        isPrimary: patch.isPrimary ?? existing.isPrimary,
        updatedAt: new Date(),
      })
      .where(eq(mediaAssets.id, id))
      .returning();
    if (updated === undefined) throw new AppError('INTERNAL');
    return updated;
  }

  async archive(id: string): Promise<MediaAssetRow> {
    const [updated] = await this.#db
      .update(mediaAssets)
      .set({ archivedAt: new Date(), isPrimary: false, updatedAt: new Date() })
      .where(eq(mediaAssets.id, id))
      .returning();
    if (updated === undefined) throw new AppError('NOT_FOUND');
    return updated;
  }

  async readPublicVariant(
    assetId: string,
    variant: MediaVariant,
  ): Promise<{ body: Buffer; contentType: string }> {
    const [asset] = await this.#db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, assetId))
      .limit(1);
    if (asset === undefined) throw new AppError('NOT_FOUND');
    if (asset.archivedAt !== null) throw new AppError('NOT_FOUND');
    if (asset.visibility !== 'public') throw new AppError('FORBIDDEN');

    const key = asset.renditions[variant] ?? asset.renditions.web ?? asset.renditions.original;
    const body = await this.#storage.get(key);
    const contentType = variant === 'original' ? asset.mimeType : 'image/jpeg';
    return { body, contentType };
  }
}
