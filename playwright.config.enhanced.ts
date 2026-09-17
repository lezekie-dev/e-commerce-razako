import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3200);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: 'qa/e2e',
  testMatch: 'm2-enhanced-tour.spec.ts',
  testIgnore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/helpers/**'],
  outputDir: 'qa/artifacts/m2-enhanced-results',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'qa/artifacts/m2-enhanced-report', open: 'never' }]],
  timeout: 180_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
    viewport: { width: 1440, height: 900 },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], channel: 'chromium' } }],
});