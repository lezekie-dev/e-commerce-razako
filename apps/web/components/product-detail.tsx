'use client';

import * as React from 'react';
import { Price, MotionFade } from '@ecommerce/ui';
import { ProductGallery } from './product-gallery';
import { VariantSelector } from './variant-selector';
import { QuantityStepper } from '@ecommerce/ui';
import { AddToCartButton } from './add-to-cart-button';
import { ProductAccordion } from './accordion';
import { RelatedProducts } from './related-products';
import type { Product } from '../lib/products';

/**
 * ProductDetail — Client Component racine de la PDP.
 *
 * - Gere la selection de variante (variantId actif).
 * - Recalcule le prix selon la variante choisie.
 * - Delegue l'affichage aux composants specialises (gallery, selector, etc).
 */

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: ReadonlyArray<Product>;
}): React.ReactElement {
  const [variantId, setVariantId] = React.useState<string>(product.variants[0]?.id ?? product.slug);
  const [quantity, setQuantity] = React.useState<number>(1);

  const selectedVariant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  const currentAmount = selectedVariant?.priceCents ?? product.priceCents;
  const currentCompareAt =
    selectedVariant?.compareAtCents ?? product.compareAtCents;
  const maxQuantity = selectedVariant?.stock ?? 99;

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Galerie */}
        <MotionFade duration={0.6} y={20}>
          <ProductGallery
            images={product.gallery?.length ? product.gallery : [{ url: product.image, alt: product.alt }]}
            name={product.name}
          />
        </MotionFade>

        {/* Col droite sticky */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <MotionFade duration={0.6} delay={0.1} y={20}>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">
              {product.brand}
            </p>
            <h1
              id="product-title"
              className="mt-2 font-display text-3xl font-medium leading-[1.1] tracking-tight text-ink-900 sm:text-4xl lg:text-5xl"
            >
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3" data-testid="product-price">
              <Price amount={currentAmount} compareAt={currentCompareAt} className="text-lg" />
              <span className="text-sm text-ink-500">TTC</span>
            </div>

            <p className="mt-6 text-base text-ink-700">{product.shortDescription}</p>

            {/* Variantes */}
            <div className="mt-8">
              <VariantSelector
                variants={product.variants}
                value={variantId}
                onChange={setVariantId}
              />
            </div>

            {/* Stock feedback */}
            <p className="mt-3 text-sm text-ink-600" aria-live="polite">
              {selectedVariant && selectedVariant.stock && selectedVariant.stock > 0 ? (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="ml-2">
                    En stock ({selectedVariant.stock} disponibles)
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-block h-2 w-2 rounded-full bg-red-500" aria-hidden="true" />
                  <span className="ml-2">Indisponible - revenez bientot</span>
                </>
              )}
            </p>

            {/* Quantite + CTA */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <QuantityStepper
                value={quantity}
                onValueChange={setQuantity}
                min={1}
                max={maxQuantity}
                disabled={!selectedVariant?.stock}
              />
              <div className="flex-1">
                <AddToCartButton
                  product={product}
                  variant={selectedVariant}
                  quantity={quantity}
                  disabled={!selectedVariant?.stock}
                />
              </div>
            </div>

            {/* Meta rapide */}
            <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-ink-200 pt-6 text-sm">
              <div>
                <dt className="font-medium text-ink-900">Livraison</dt>
                <dd className="text-ink-600">
                  {product.freeShippingEligible ? 'Offerte des 80 EUR' : 'Standard 5,90 EUR'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-ink-900">Retours</dt>
                <dd className="text-ink-600">30 jours pour changer d&apos;avis</dd>
              </div>
            </dl>
          </MotionFade>
        </div>
      </div>

      {/* Accordion Description / Materiaux / Livraison / Avis */}
      <div className="mt-16 max-w-3xl" data-testid="product-accordion">
        <ProductAccordion
          sections={[
            {
              id: 'description',
              title: 'Description',
              content: (
                <div className="space-y-3 text-ink-700">
                  <p>{product.description}</p>
                  {product.story ? (
                    <p className="italic text-ink-600">{product.story}</p>
                  ) : null}
                </div>
              ),
            },
            {
              id: 'materials',
              title: 'Materiaux & entretien',
              content: (
                <div className="space-y-4 text-ink-700">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                      Materiaux
                    </p>
                    <ul role="list" className="mt-2 list-disc space-y-1 pl-5">
                      {product.materials.map((m) => (
                        <li key={m}>{m}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink-500">
                      Entretien
                    </p>
                    <ul role="list" className="mt-2 list-disc space-y-1 pl-5">
                      {product.care.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ),
            },
            {
              id: 'shipping',
              title: 'Livraison & retours',
              content: (
                <div className="space-y-2 text-ink-700">
                  <p>
                    Livraison sous 3 a 5 jours ouvres en France metropolitaine. Livraison offerte des 80 EUR d&apos;achat.
                  </p>
                  <p>
                    Retour gratuit sous 30 jours. Le produit doit etre dans son emballage d&apos;origine, non utilise.
                  </p>
                </div>
              ),
            },
            {
              id: 'reviews',
              title: 'Avis clients',
              content: (
                <p className="text-ink-700">
                  Les avis seront disponibles prochainement. En attendant, n&apos;hesitez pas a nous contacter pour toute question.
                </p>
              ),
            },
          ]}
        />
      </div>

      {/* Produits similaires */}
      {related.length > 0 ? (
        <section className="mt-20" aria-labelledby="related-heading">
          <h2
            id="related-heading"
            className="mb-8 font-display text-2xl font-medium tracking-tight text-ink-900 sm:text-3xl"
          >
            Vous aimerez aussi
          </h2>
          <RelatedProducts items={related} />
        </section>
      ) : null}

      {/* Sticky CTA mobile */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-200 bg-white/95 p-4 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs text-ink-500">{product.name}</p>
            <Price amount={currentAmount} compareAt={currentCompareAt} className="text-lg" />
          </div>
          <AddToCartButton
            product={product}
            variant={selectedVariant}
            quantity={quantity}
            disabled={!selectedVariant?.stock}
          />
        </div>
      </div>
    </>
  );
}