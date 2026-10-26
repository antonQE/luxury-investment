import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { AppError } from '../../../errors/app-error.ts';
import type { PutObjectInput, StoragePort, StoredObject } from './storage-port.ts';

function assertSafeKey(key: string): void {
  if (key.length === 0 || key.includes('\0') || path.isAbsolute(key)) {
    throw new AppError('VALIDATION_FAILED', 'Invalid storage key.');
  }
  const normalized = path.posix.normalize(key);
  if (normalized.startsWith('..') || normalized.includes('/../')) {
    throw new AppError('VALIDATION_FAILED', 'Invalid storage key.');
  }
}

export class LocalStorage implements StoragePort {
  readonly #root: string;
  readonly #publicBaseUrl: string;

  constructor(root: string, publicBaseUrl: string) {
    this.#root = path.resolve(root);
    this.#publicBaseUrl = publicBaseUrl.replace(/\/$/, '');
  }

  async put(input: PutObjectInput): Promise<StoredObject> {
    assertSafeKey(input.key);
    const absolute = path.join(this.#root, input.key);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, input.body);
    return {
      key: input.key,
      contentType: input.contentType,
      byteSize: input.body.byteLength,
    };
  }

  async get(key: string): Promise<Buffer> {
    assertSafeKey(key);
    try {
      return await readFile(path.join(this.#root, key));
    } catch {
      throw new AppError('NOT_FOUND', 'Media object not found.');
    }
  }

  async delete(key: string): Promise<void> {
    assertSafeKey(key);
    try {
      await unlink(path.join(this.#root, key));
    } catch {
      // already gone
    }
  }

  publicUrl(key: string): string {
    assertSafeKey(key);
    const encoded = key
      .split('/')
      .map((part) => encodeURIComponent(part))
      .join('/');
    return `${this.#publicBaseUrl}/${encoded}`;
  }
}
