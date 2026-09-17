'use client';

/**
 * <ProductCard> — composant canonique du catalogue
 *
 * Effets premium :
 * - 3D tilt sur hover (perspective + rotateX/rotateY mousemove).
 * - Image parallax interne (l'image bouge un peu moins que la carte → effet 3D).
 * - Image scale + zoom doux au hover.
 * - Shimmer effect : un halo lumineux balaye la carte à l'entrée du hover.
 * - Quick-add : bouton overlay avec ripple + scale-bounce sur ajout.
 * - Badges new / promo / last branchés sur les variants du DS.
 * - Focus-within équivalent au hover (clavier friendly).
 */

import * as React from 'react';
import { Plus, Check } from 'lucide-react';
import { motion, useMotionValue, useSpring, useReducedMotion, useTransform } from 'framer-motion';
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

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];
const MAX_TILT = 6; // degrés max de tilt

export function ProductCard({
  product,
  onQuickAdd,
  priority: _priority = false,
  className,
  ...rest
}: ProductCardProps) {
  const reduced = useReducedMotion();
  const [quickAddFeedback, setQuickAddFeedback] = React.useState<'idle' | 'added'>('idle');
  const [isHovered, setIsHovered] = React.useState(false);

  // 3D tilt — mousemove position relative au centre
  const ref = React.useRef<HTMLElement | null>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [MAX_TILT, -MAX_TILT]), {
    stiffness: 200,
    damping: 18,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-MAX_TILT, MAX_TILT]), {
    stiffness: 200,
    damping: 18,
  });
  // Image inner parallax — bouge 2x moins que la carte
  const imageX = useSpring(useTransform(rotateY, (v) => v * -1.5), { stiffness: 200, damping: 18 });
  const imageY = useSpring(useTransform(rotateX, (v) => v * -1.5), { stiffness: 200, damping: 18 });
  // Shimmer position (x en %)
  const shimmerX = useTransform(px, [0, 1], ['-30%', '130%']);

  React.useEffect(() => {
    if (reduced) return;
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      px.set((e.clientX - rect.left) / rect.width);
      py.set((e.clientY - rect.top) / rect.height);
    };
    const onEnter = () => setIsHovered(true);
    const onLeave = () => {
      setIsHovered(false);
      px.set(0.5);
      py.set(0.5);
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [reduced, px, py]);

  const handleQuickAdd = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!onQuickAdd) return;
    onQuickAdd(product);
    setQuickAddFeedback('added');
    window.setTimeout(() => setQuickAddFeedback('idle'), 900);
  };

  const badge = product.badge ? badgeMeta[product.badge] : null;
  const discount =
    product.compareAt && product.compareAt > product.amount
      ? Math.round(((product.compareAt - product.amount) / product.compareAt) * 100)
      : 0;

  return (
    <motion.article
      ref={ref as React.RefObject<HTMLElement>}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white',
        'transition-[box-shadow,border-color] duration-300 ease-out',
        'hover:border-ink-300 hover:shadow-[0_32px_64px_-24px_rgba(24,24,27,0.22)]',
        'focus-within:shadow-[0_32px_64px_-24px_rgba(24,24,27,0.22)]',
        !reduced && 'will-change-transform',
        className
      )}
      style={{
        rotateX: reduced ? 0 : rotateX,
        rotateY: reduced ? 0 : rotateY,
        transformPerspective: 1200,
        transformStyle: 'preserve-3d',
      }}
      whileHover={reduced ? undefined : { y: -4 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      {...(rest as React.ComponentPropsWithoutRef<typeof motion.article>)}
    >
      {/* Shimmer — halo lumineux qui balaye la carte au hover */}
      {!reduced && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-[5] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        >
          <motion.div
            className="absolute inset-y-0 w-[40%] -skew-x-12 bg-gradient-to-r90"
            style={{
              x: shimmerX,
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.0) 30%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.0) 70%, transparent 100%)',
              filter: 'blur(8px)',
            }}
          />
        </motion.div>
      )}

      <a
        href={`/products/${product.slug}`}
        aria-label={`Voir ${product.name}`}
        className="absolute inset-0 z-[1] rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2"
      >
        <span className="sr-only">Voir {product.name}</span>
      </a>

      <div
        className="relative aspect-square w-full overflow-hidden bg-ink-50"
        style={!reduced ? { transformStyle: 'preserve-3d' } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img
          src={product.image}
          alt={product.alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover will-change-transform"
          style={{
            x: reduced ? 0 : imageX,
            y: reduced ? 0 : imageY,
            scale: isHovered && !reduced ? 1.08 : 1,
            transition: 'scale 700ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
        {badge ? (
          <Badge
            variant={badge.variant}
            className="absolute left-3 top-3 z-[2] shadow-sm backdrop-blur-sm"
          >
            {badge.label}
          </Badge>
        ) : null}
        {discount > 0 ? (
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 z-[2] inline-flex items-center justify-center rounded-full bg-ink-900 px-2.5 py-1 text-xs font-semibold text-white shadow-sm"
          >
            −{discount}%
          </span>
        ) : null}
        {onQuickAdd ? (
          <div
            className={cn(
              'absolute inset-x-3 bottom-3 z-[3] flex justify-end opacity-0 transition-all duration-300 ease-out',
              'translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100'
            )}
          >
            <motion.button
              type="button"
              onClick={handleQuickAdd}
              aria-label={
                quickAddFeedback === 'added'
                  ? `${product.name} ajouté au panier`
                  : `Ajouter ${product.name} au panier`
              }
              animate={
                quickAddFeedback === 'added'
                  ? { scale: [1, 1.2, 1], backgroundColor: ['#18181B', '#16A34A', '#16A34A'] }
                  : { scale: 1, backgroundColor: '#18181B' }
              }
              transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
              className={cn(
                'inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium text-white shadow-lg',
                'transition-colors hover:bg-accent-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2'
              )}
              style={quickAddFeedback === 'added' ? { backgroundColor: '#16A34A' } : undefined}
            >
              {quickAddFeedback === 'added' ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Plus className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">
                {quickAddFeedback === 'added' ? 'Ajouté' : 'Ajouter'}
              </span>
            </motion.button>
          </div>
        ) : null}
      </div>

      <div
        className="relative z-[2] flex flex-1 flex-col gap-2 p-4"
        style={{ transform: 'translateZ(20px)' }}
      >
        <p className="line-clamp-2 text-sm font-medium text-ink-900">{product.name}</p>
        <div className="mt-auto flex items-center gap-2">
          <Price
            amount={product.amount}
            compareAt={product.compareAt}
            currency={product.currency}
            className="text-base"
          />
        </div>
      </div>
    </motion.article>
  );
}