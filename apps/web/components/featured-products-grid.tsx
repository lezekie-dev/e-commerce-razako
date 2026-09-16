'use client';

/**
 * Grille featured products — utilise le ProductCard canonique du DS.
 * Chaque carte propose un quick-add qui déclenche un toast + panier.
 */

import * as React from 'react';
import { ProductCard, MotionStagger, MotionStaggerItem, MotionFade, type ProductCardData } from '@ecommerce/ui';
import { useAddToCart } from '../lib/use-add-to-cart';

interface VariantLite {
  id: string;
  price: number;
  compareAt?: number;
}

interface Item {
  slug: string;
  name: string;
  image: string;
  alt: string;
  amount: number;
  compareAt?: number;
  badge?: 'new' | 'promo' | 'last';
  category?: string;
  variants: VariantLite[];
}

interface FeaturedProductsGridProps {
  items: ReadonlyArray<Item>;
  priorityFirst?: boolean;
}

export function FeaturedProductsGrid({ items, priorityFirst = false }: FeaturedProductsGridProps) {
  const add = useAddToCart();

  return (
    <MotionStagger className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item, index) => {
        const data: ProductCardData = {
          slug: item.slug,
          name: item.name,
          image: item.image,
          alt: item.alt,
          amount: item.amount,
          compareAt: item.compareAt,
          badge: item.badge,
          category: item.category,
        };
        const firstVariantId = item.variants[0]?.id ?? item.slug;
        return (
          <MotionStaggerItem key={item.slug}>
            <ProductCard
              product={data}
              priority={priorityFirst && index === 0}
              onQuickAdd={() =>
                add({
                  variantId: firstVariantId,
                  productSlug: item.slug,
                  name: item.name,
                  image: item.image,
                  amount: item.amount,
                  compareAt: item.compareAt,
                  options: [{ label: 'Option', value: firstVariantId }],
                  maxQuantity: 10,
                })
              }
            />
          </MotionStaggerItem>
        );
      })}
    </MotionStagger>
  );
}
