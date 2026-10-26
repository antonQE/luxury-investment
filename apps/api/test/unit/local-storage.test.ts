import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { LocalStorage } from '../../src/modules/media/storage/local-storage.ts';

describe('LocalStorage', () => {
  let root = '';

  afterEach(async () => {
    if (root.length > 0) {
      await rm(root, { recursive: true, force: true });
      root = '';
    }
  });

  it('puts, gets, public-urls and deletes objects', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'li-media-'));
    const storage = new LocalStorage(root, 'http://localhost:4000/v1/public/media');
    const body = Buffer.from('hello-media');

    const stored = await storage.put({
      key: 'properties/demo/original/a.txt',
      body,
      contentType: 'text/plain',
    });
    expect(stored.byteSize).toBe(body.byteLength);

    const read = await storage.get('properties/demo/original/a.txt');
    expect(read.toString('utf8')).toBe('hello-media');
    expect(storage.publicUrl('properties/demo/original/a.txt')).toBe(
      'http://localhost:4000/v1/public/media/properties/demo/original/a.txt',
    );

    await storage.delete('properties/demo/original/a.txt');
    await expect(storage.get('properties/demo/original/a.txt')).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });
  });

  it('rejects path traversal keys', async () => {
    root = await mkdtemp(path.join(tmpdir(), 'li-media-'));
    const storage = new LocalStorage(root, 'http://localhost:4000/v1/public/media');
    await expect(
      storage.put({ key: '../escape.txt', body: Buffer.from('x'), contentType: 'text/plain' }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
    await expect(
      storage.put({
        key: 'properties/../../escape.txt',
        body: Buffer.from('x'),
        contentType: 'text/plain',
      }),
    ).rejects.toMatchObject({ code: 'VALIDATION_FAILED' });
  });
});
