/**
 * Design tokens — single source of truth.
 *
 * Conventions :
 * - Palette exposée en deux formes :
 *   (a) constantes TS pour runtime (tests, JS, calculs)
 *   (b) classes Tailwind générées (voir `tw()` ci-dessous)
 * - Les noms d'objets (ink, accent, semantic) correspondent
 *   aux clés du theme Tailwind déclarées dans `tailwind.config.ts`.
 *
 * Règle d'or : NE JAMAIS hardcoder une couleur dans un composant.
 * Toujours passer par ces tokens ou par les classes Tailwind du theme.
 *
 * Accent brand : #C04A2A (terracotta) → `accent.700`.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Palette — rampes 50→900 (Tailwind convention)
// ─────────────────────────────────────────────────────────────────────────────

export const ink = {
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
} as const;

export const accent = {
  50: '#FDF4F0',
  100: '#FAE5DC',
  200: '#F4C6B5',
  300: '#ECA38A',
  400: '#E07E5F',
  500: '#D8633F',
  600: '#C95230',
  700: '#C04A2A', // ← brand
  800: '#9D3D24',
  900: '#7A2F1B',
} as const;

export const danger = {
  50: '#FEF2F2',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
} as const;

export const success = {
  50: '#F0FDF4',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
} as const;

export const warning = {
  50: '#FFFBEB',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
} as const;

// Tokens sémantiques (rappellent `--color-*` CSS mais utilisables en TS).
// `bg-surface` Tailwind ↔ `semantic.surface`.
export const semantic = {
  bg: '#FFFFFF',
  surface: ink[50],
  fg: ink[900],
  muted: ink[500],
  border: ink[200],
  ring: accent[600],
  danger: danger[600],
  success: success[600],
  warning: warning[600],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Spacing — échelle 4 px
// ─────────────────────────────────────────────────────────────────────────────

export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
} as const;

export type SpacingScale = keyof typeof spacing;

// ─────────────────────────────────────────────────────────────────────────────
// Radius
// ─────────────────────────────────────────────────────────────────────────────

export const radius = {
  none: '0',
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

export type RadiusScale = keyof typeof radius;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — pont vers Tailwind
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construit une classe Tailwind à partir d'un préfixe et d'une clé palette.
 * Ex: `tw('bg', 'accent', 700)` → `'bg-accent-700'`.
 * Utile pour générer des variants dynamiquement depuis les tokens.
 */
export function tw<T extends number>(
  prefix: 'bg' | 'text' | 'border' | 'ring',
  family: 'ink' | 'accent',
  shade: T,
): string {
  return `${prefix}-${family}-${shade}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type InkScale = keyof typeof ink;
export type AccentScale = keyof typeof accent;
export type DangerScale = keyof typeof danger;
export type SuccessScale = keyof typeof success;
export type WarningScale = keyof typeof warning;