'use client';

/**
 * <ProductCard> — composant canonique du catalogue
 *
 * Couvre (cf. brief Frontend Dev) :
 * - Hover : image scale doux, badge action rapide apparaît, ombre s'élève.
 * - Image : aspect-square, object-cover, alt obligatoire (a11y).
 * - Badges : new / promo / last branchés sur les variants du DS.
 * - Quick-add : bouton overlay sur l'image, déclenche `onQuickAdd`.
 * - Carte = un seul lien principal (le titre), quick-add = bouton focus
 *   accessible distinct.
 * - Prix : utilise `<Price>` du DS (fr-FR EUR automatique).
 *
 * Note : on utilise `<img>` natif plutôt que `next/image` pour rester
 * portable hors du runtime Next.js (le consumer peut wrapper s'il veut
 * l'optimisation). En pratique, on ajoutera un composant spécifique
 * `NextProductImage` côté web Phase M3 si besoin de LCP opti.
 */

import * as React from 'react';
import { Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Badge } from './badge';
import { Price } from './price';
import { cn } from './cn';

export type ProductBadge = 'new' | 'promo' | 'last';

export interface ProductCardData {
  slug: string;
  name: string;
  image: string;
  alt: string;
  amount: number;
  compareAt?: number;
  badge?: ProductBadge;
  currency?: string;
  category?: string;
}

export interface ProductCardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'onClick'> {
  product: ProductCardData;
  onQuickAdd?: (product: ProductCardData) => void;
  priority?: boolean;
}

const badgeMeta: Record<ProductBadge, { variant: 'accent' | 'success' | 'warning'; label: string }> = {
  new: { variant: 'success', label: 'Nouveauté' },
  promo: { variant: 'accent', label: 'Promo' },
  last: { variant: 'warning', label: 'Dernières pièces' },
};

export function ProductCard({ product, onQuickAdd, priority: _priority = false, className, ...rest }: ProductCardProps) {
  const reduced = useReducedMotion();
  const [quickAddFeedback, setQuickAddFeedback] = React.useState(false);

  const handleQuickAdd = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onQuickAdd) return;
    onQuickAdd(product);
    setQuickAddFeedback(true);
    window.setTimeout(() => setQuickAddFeedback(false), 600);
  };

  const badge = product.badge ? badgeMeta[product.badge] : null;

  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:border-ink-300 hover:shadow-[0_24px_48px_-24px_rgba(24,24,27,0.18)]',
        'focus-within:-translate-y-1 focus-within:shadow-[0_24px_48px_-24px_rgba(24,24,27,0.18)]',
        className
      )}
      {...rest}
    >
      <a
        href={`/products/${product.slug}`}
        aria-label={`Voir ${product.name}`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
      >
        <span className="sr-only">Voir {product.name}</span>
      </a>

      <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          decoding="async"
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-transform duration-[700ms] ease-out will-change-transform',
            'group-hover:scale-[1.06]'
          )}
        />
        {badge ? (
          <Badge variant={badge.variant} className="absolute left-3 top-3 z-[2] shadow-sm backdrop-blur-sm">
            {badge.label}
          </Badge>
        ) : null}
        {onQuickAdd ? (
          <div
            className={cn(
              'absolute inset-x-3 bottom-3 z-[3] flex justify-end opacity-0 transition-all duration-300 ease-out',
              'group-hover:opacity-100 group-focus-within:opacity-100'
            )}
          >
            <motion.button
              type="button"
              onClick={handleQuickAdd}
              aria-label={`Ajouter ${product.name} au panier`}
              animate={quickAddFeedback ? { scale: [1, 1.15, 1] } : { scale: 1 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full bg-ink-900 px-4 text-sm font-medium text-white shadow-lg',
                'transition-colors hover:bg-accent-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2'
              )}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Ajouter</span>
            </motion.button>
          </div>
        ) : null}
      </div>

      <div className="relative z-[2] flex flex-1 flex-col gap-2 p-4">
        <p className="line-clamp-2 text-sm font-medium text-ink-900">{product.name}</p>
        <div className="mt-auto flex items-center gap-2">
          <Price
            amount={product.amount}
            compareAt={product.compareAt}
            currency={product.currency}
            className="text-base"
          />
          {product.compareAt && product.compareAt > product.amount ? (
            <span className="text-xs font-medium text-success-700">
              −{Math.round(((product.compareAt - product.amount) / product.compareAt) * 100)}%
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
