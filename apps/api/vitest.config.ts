import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: ['./test/global-setup.ts'],
    fileParallelism: false,
    // Coverage instrumentation + shared Postgres is deadlock-prone with multiple workers.
    maxWorkers: 1,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/main.ts',
        'src/scripts/**',
        'src/infrastructure/db/migrations/**',
        'src/infrastructure/db/seeds/**',
      ],
      thresholds: {
        // Floor against regression; branches sit ~60% with current suite shape.
        lines: 75,
        branches: 55,
        functions: 70,
        statements: 75,
      },
    },
  },
});
