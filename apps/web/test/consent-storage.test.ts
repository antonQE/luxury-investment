import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

function installLocalStorage() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
  vi.stubGlobal('window', {
    localStorage,
    dispatchEvent: () => true,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
  });
}

describe('readConsent snapshot stability', () => {
  beforeEach(() => {
    installLocalStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('returns the same object reference while localStorage is unchanged', async () => {
    const { readConsent, writeConsent } = await import('../src/lib/consent/storage');
    writeConsent(true);
    const first = readConsent();
    const second = readConsent();
    expect(first).not.toBeNull();
    expect(second).toBe(first);
  });
});
