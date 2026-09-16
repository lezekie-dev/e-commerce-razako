// vitest.config.ts
// Maison 14 — configuration Vitest racine du monorepo.
// Cible : unit + intégration des packages et des apps.
// Coverage v8 avec seuils ≥ 80 % sur lines / branches / functions / statements.

import { defineConfig } from 'vitest/config';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const R = (p: string) => resolve(__dirname, p);

export default defineConfig({
  resolve: {
    alias: {
      '@ecommerce/ui': R('packages/ui/src'),
      '@ecommerce/shared': R('packages/shared/src'),
      '@ecommerce/db': R('packages/db/src'),
      '@/components': R('apps/web/components'),
      '@/lib': R('apps/web/lib'),
    },
  },

  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['qa/unit/setup.ts'],

    include: [
      'qa/unit/**/*.{test,spec}.{ts,tsx}',
      'packages/**/*.{test,spec}.{ts,tsx}',
      'apps/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.turbo/**',
      'qa/e2e/**',          // e2e = Playwright, pas Vitest
      '**/artifacts/**',
    ],

    css: false,
    clearMocks: true,
    restoreMocks: true,
    pool: 'threads',
    poolOptions: { threads: { singleThread: !!process.env.CI } },

    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      reportsDirectory: './qa/artifacts/coverage',

      include: [
        'apps/**/*.{ts,tsx}',
        'packages/**/*.{ts,tsx}',
        'qa/**/*.{ts,tsx}',
      ],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.next/**',
        '**/.turbo/**',
        '**/*.config.{ts,js,mjs}',
        '**/*.d.ts',
        '**/coverage/**',
        '**/artifacts/**',
        '**/*.spec.{ts,tsx}',
        '**/*.test.{ts,tsx}',
        '**/setup.ts',
        '**/types.ts',
      ],

      thresholds: {
        lines: 80,
        branches: 80,
        functions: 80,
        statements: 80,
      },
    },
  },
});