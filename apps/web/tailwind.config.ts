import type { Config } from 'tailwindcss'

/**
 * Tailwind config — apps/web
 *
 * Source de vérité : `packages/ui/src/tokens.ts`
 * Les rampes `ink-{50..900}` et `accent-{50..900}` sont exposées ici en classes
 * Tailwind natives (avec support `<alpha-value>` pour les modificateurs /60, /80).
 *
 * Les anciennes classes `bg / surface / fg / muted / brand / accent / success /
 * danger / border` (CSS variables) restent pour rétro-compat avec le code
 * historique qui les utilise.
 *
 * Tokens alignés sur `tokens.ts` (D-02 + D-12) :
 * - Brand accent : terracotta #C04A2A → accent.700
 * - Inks : échelle zinc-ish neutre
 * - Sémantiques : success / warning / danger / info
 */

const ink = {
  50: '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
}

const accent = {
  50: '#FDF4F0',
  100: '#FAE5DC',
  200: '#F4C6B5',
  300: '#ECA38A',
  400: '#E07E5F',
  500: '#D8633F',
  600: '#C95230',
  700: '#C04A2A', // ← brand terracotta
  800: '#9D3D24',
  900: '#7A2F1B',
}

const danger = {
  50: '#FEF2F2',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
}

const success = {
  50: '#F0FDF4',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
}

const warning = {
  50: '#FFFBEB',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
}

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ───────────────────────────────────────────────────────────────
        // CSS variables (rétro-compat) — déclarées dans globals.css
        // ───────────────────────────────────────────────────────────────
        bg: 'rgb(var(--bg) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        // ───────────────────────────────────────────────────────────────
        // Rampes natives (source : packages/ui/src/tokens.ts)
        // ───────────────────────────────────────────────────────────────
        ink,
        accent,
        // ───────────────────────────────────────────────────────────────
        // Sémantiques
        // ───────────────────────────────────────────────────────────────
        success: {
          50: success[50],
          500: success[500],
          600: success[600],
          700: success[700],
          DEFAULT: success[600],
        },
        warning: {
          50: warning[50],
          500: warning[500],
          600: warning[600],
          700: warning[700],
          DEFAULT: warning[600],
        },
        danger: {
          50: danger[50],
          500: danger[500],
          600: danger[600],
      700: danger[700],
          DEFAULT: danger[600],
        },
        border: 'rgb(var(--border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        display: ['var(--font-display)'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

export default config