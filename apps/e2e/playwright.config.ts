import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const WEB_URL = process.env.E2E_WEB_URL ?? 'http://localhost:3000';
const ADMIN_URL = process.env.E2E_ADMIN_URL ?? 'http://localhost:5173';
const API_URL = process.env.E2E_API_URL ?? 'http://localhost:4000';
const reuse = process.env.E2E_REUSE_SERVER === '1';
const useProdServers = Boolean(process.env.CI) || process.env.E2E_PROD_SERVERS === '1';

const authFile = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'playwright/.auth/admin.json',
);

export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    baseURL: WEB_URL,
  },
  projects: [
    {
      name: 'public',
      testMatch: /public\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: WEB_URL },
    },
    {
      name: 'admin-setup',
      testMatch: /admin\/auth\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: ADMIN_URL },
    },
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      dependencies: ['admin-setup'],
      use: {
        ...devices['Desktop Chrome'],
        baseURL: ADMIN_URL,
        storageState: authFile,
      },
    },
  ],
  webServer: reuse
    ? undefined
    : [
        {
          command: 'npm run start -w @luxury-investment/api',
          cwd: rootDir,
          url: `${API_URL}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            NODE_ENV: process.env.NODE_ENV ?? 'development',
            API_LOG_LEVEL: 'error',
          },
        },
        {
          command: useProdServers
            ? 'npm run start -w @luxury-investment/web'
            : 'npm run dev -w @luxury-investment/web',
          cwd: rootDir,
          url: WEB_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 180_000,
          env: {
            ...process.env,
            API_URL,
            NEXT_PUBLIC_API_URL: API_URL,
          },
        },
        {
          command: useProdServers
            ? 'npm run preview -w @luxury-investment/admin'
            : 'npm run dev -w @luxury-investment/admin',
          cwd: rootDir,
          url: ADMIN_URL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            VITE_API_URL: API_URL,
          },
        },
      ],
});
