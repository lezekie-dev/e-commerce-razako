'use client';

import * as React from 'react';
import { ProductCard, MotionStagger, MotionStaggerItem } from '@ecommerce/ui';
import { useAddToCart } from '../lib/use-add-to-cart';
import type { Product } from '../lib/products';

/**
 * RelatedProducts — 4 cards horizontales sous la PDP.
 *
 * - Reprend ProductCard du DS pour la coherence visuelle.
 * - Quick-add via useAddToCart (meme UX que la grille featured).
 */

export function RelatedProducts({
  items,
}: {
  items: ReadonlyArray<Product>;
}): React.ReactElement {
  const add = useAddToCart();

  return (
    <MotionStagger
      
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
      data-testid="related-products"
    >
      {items.map((product) => {
        const firstVariant = product.variants[0];
        return (
          <MotionStaggerItem key={product.slug}>
            <ProductCard
              product={{
                slug: product.slug,
                name: product.name,
                image: product.image,
                alt: product.alt,
                amount: product.priceCents,
                compareAt: product.compareAtCents,
                badge: product.badge,
                category: product.category,
              }}
              onQuickAdd={() =>
                add({
                  variantId: firstVariant?.id ?? product.slug,
                  productSlug: product.slug,
                  name: product.name,
                  image: product.image,
                  amount: product.priceCents,
                  compareAt: product.compareAtCents,
                  options: firstVariant?.options?.map((o) => ({ label: o.label, value: o.value })) ?? [],
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