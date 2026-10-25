import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    // next-intl imports `next/server` without an extension, which only bundlers resolve.
    server: { deps: { inline: ['next-intl'] } },
  },
});
