// playwright.config.ts
// Maison 14 — configuration Playwright racine du monorepo.
// Standard : 3 navigateurs (chromium / firefox / webkit), baseURL dev,
// webServer pnpm avec reuseExistingServer en local.

import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const IS_CI = !!process.env.CI;

export default defineConfig({
  testDir: '.',
  testMatch: 'test-e2e-*.spec.ts',
  testIgnore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/helpers/**'],

  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 2 : 0,
  workers: IS_CI ? 1 : undefined,

  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../qa/artifacts/playwright-report' }],
    ['json', { outputFile: '../../qa/artifacts/playwright-results.json' }],
  ],

  timeout: 30_000,
  expect: { timeout: 5_000 },
  globalTimeout: IS_CI ? 10 * 60_000 : undefined,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on',
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: '/usr/bin/chromium', args: ['--no-sandbox', '--disable-dev-shm-usage'] } } },
  ],

  webServer: {
    command: 'pnpm --filter @ecommerce/web dev',
    url: BASE_URL,
    reuseExistingServer: !IS_CI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  metadata: {
    team: 'maison-14',
    suite: 'e2e-smoke',
    baseURL: BASE_URL,
  },
});