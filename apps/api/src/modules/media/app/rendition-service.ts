import sharp from 'sharp';

import { AppError } from '../../../errors/app-error.ts';
import type { MediaRenditions } from '../repo/media.schema.ts';
import type { StoragePort } from '../storage/storage-port.ts';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;

export function assertAllowedImage(mimeType: string, byteSize: number): void {
  if (!ALLOWED_MIME.has(mimeType)) {
    throw new AppError('VALIDATION_FAILED', 'Unsupported image type.');
  }
  if (byteSize <= 0 || byteSize > MAX_UPLOAD_BYTES) {
    throw new AppError('VALIDATION_FAILED', 'Image exceeds size limit (12MB).');
  }
}

export class RenditionService {
  readonly #storage: StoragePort;

  constructor(storage: StoragePort) {
    this.#storage = storage;
  }

  async processImage(input: {
    propertyId: string;
    assetId: string;
    body: Buffer;
    mimeType: string;
  }): Promise<{ renditions: MediaRenditions; width: number; height: number; byteSize: number }> {
    assertAllowedImage(input.mimeType, input.body.byteLength);
    const meta = await sharp(input.body).metadata();
    const width = meta.width;
    const height = meta.height;
    const ext = input.mimeType === 'image/png' ? 'png' : 'jpg';
    const base = `properties/${input.propertyId}/${input.assetId}`;

    const originalKey = `${base}/original.${ext}`;
    await this.#storage.put({
      key: originalKey,
      body: input.body,
      contentType: input.mimeType,
    });

    const web = await sharp(input.body)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    const webKey = `${base}/web.jpg`;
    await this.#storage.put({ key: webKey, body: web, contentType: 'image/jpeg' });

    const thumb = await sharp(input.body)
      .rotate()
      .resize({ width: 400, height: 400, fit: 'cover' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();
    const thumbKey = `${base}/thumb.jpg`;
    await this.#storage.put({ key: thumbKey, body: thumb, contentType: 'image/jpeg' });

    const social = await sharp(input.body)
      .rotate()
      .resize({ width: 1200, height: 630, fit: 'cover' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    const socialKey = `${base}/social.jpg`;
    await this.#storage.put({ key: socialKey, body: social, contentType: 'image/jpeg' });

    return {
      renditions: {
        original: originalKey,
        web: webKey,
        thumb: thumbKey,
        social: socialKey,
      },
      width,
      height,
      byteSize: input.body.byteLength,
    };
  }
}
