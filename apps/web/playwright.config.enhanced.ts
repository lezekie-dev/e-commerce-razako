import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT ?? 3200);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;
const ROOT = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: path.join(ROOT, 'qa/e2e'),
  testMatch: 'm2-enhanced-tour.spec.ts',
  testIgnore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/helpers/**'],
  outputDir: path.join(ROOT, 'qa/artifacts/m2-enhanced-results'),
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(ROOT, 'qa/artifacts/m2-enhanced-report'), open: 'never' }],
  ],
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