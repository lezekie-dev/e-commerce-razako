'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@ecommerce/ui';

/**
 * ProductGallery — galerie image principale + thumbnails.
 *
 * - Image principale (LCP) avec zoom au hover (desktop) via transform CSS.
 * - Thumbnails : clic = change l'image principale, navigation clavier
 *   flechees gauche/droite.
 * - Swipe mobile : basique via overflow-x scroll sur la barre de thumbs.
 * - Pas de lightbox (M3) — hover zoom suffit pour la spec.
 */

interface GalleryImage {
  url: string;
  alt: string;
}

export function ProductGallery({
  images,
  name,
}: {
  images: ReadonlyArray<GalleryImage>;
  name: string;
}): React.ReactElement {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const mainRef = React.useRef<HTMLDivElement>(null);

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-ink-100" aria-label={`Galerie vide pour ${name}`} />
    );
  }

  const active = images[activeIndex];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + images.length) % images.length);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % images.length);
    }
  };

  return (
    <div data-testid="product-gallery">
      {/* Image principale */}
      <div
        ref={mainRef}
        className="group relative aspect-square w-full overflow-hidden rounded-2xl bg-ink-100"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="region"
        aria-label={`Galerie ${name}`}
      >
        <Image
          src={active?.url ?? images[0]?.url ?? ''}
          alt={active?.alt ?? images[0]?.alt ?? ''}
          fill
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge zoom (visuel desktop seulement) */}
        <div className="pointer-events-none absolute bottom-3 right-3 hidden rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-700 opacity-0 transition-opacity duration-300 group-hover:opacity-100 lg:block">
          Survolez pour zoomer
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 ? (
        <div
          role="tablist"
          aria-label="Vignettes"
          className="mt-4 flex gap-3 overflow-x-auto pb-2"
          data-testid="product-thumbs"
        >
          {images.map((img, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={`${img.url}-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="main-gallery"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2',
                  selected
                    ? 'border-accent-700 ring-2 ring-accent-600 ring-offset-1'
                    : 'border-transparent hover:border-ink-300',
                )}
                data-testid={`thumb-${index}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}