/**
 * Formatters — apps/web
 * Helpers de formatage partages (prix, dates, PII).
 * Pas de dependances React — utilisable cote serveur (RSC + Server Actions).
 *
 * Conventions :
 * - Prix : TOUJOURS en centimes (number entier) → formatPriceCents.
 * - Dates : ISO string OU Date. Locale fr-FR par defaut (site fr).
 */

/** Formate un prix en centimes vers une string currency-aware (defaut EUR, fr-FR). */
export function formatPriceCents(
  cents: number,
  currency: string = 'EUR',
  locale: string = 'fr-FR'
): string {
  if (!Number.isFinite(cents)) return '—';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

/** Formate une date pour les pages de compte / confirmation de commande. */
export function formatOrderDate(
  date: Date | string,
  locale: string = 'fr-FR'
): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d);
}

/**
 * Masque un email pour affichage cote UI (RGPD-friendly).
 * `alice@maison14.fr` → `al***@maison14.fr`.
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  const at = email.indexOf('@');
  if (at <= 0) return email;
  const local = email.slice(0, at);
  const domain = email.slice(at + 1);
  const visibleCount = Math.min(2, local.length);
  const maskedCount = Math.max(1, local.length - visibleCount);
  return `${local.slice(0, visibleCount)}${'*'.repeat(maskedCount)}@${domain}`;
}

/** Genere un slug URL-safe depuis un titre. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}