// playwright-no-server.config.ts
// Variante sans webServer : on suppose que le serveur tourne déjà sur :3000
import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3000);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: '.',
  testMatch: 'test-e2e-*.spec.ts',
  testIgnore: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/helpers/**'],
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../../qa/artifacts/playwright-report' }],
    ['json', { outputFile: '../../qa/artifacts/playwright-results.json' }],
  ],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
    locale: 'fr-FR',
    timezoneId: 'Europe/Paris',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/usr/bin/chromium',
          args: ['--no-sandbox', '--disable-dev-shm-usage'],
        },
      },
    },
  ],
  metadata: { team: 'maison-14', suite: 'e2e-smoke', baseURL: BASE_URL },
});
