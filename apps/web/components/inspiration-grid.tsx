'use client';

/**
 * InspirationGrid — masonry 6 images "Inspiration"
 *
 * Grille asymétrique (1 grande + 2 moyennes + 3 petites). Reveal au scroll.
 * Hover : image scale + overlay gradient + caption translate-up.
 *
 * Pas de vraies images — utilise les collections vedettes comme placeholders.
 */

import * as React from 'react';
import Image from 'next/image';
import { MotionFade } from '@ecommerce/ui';

interface Inspiration {
  src: string;
  alt: string;
  caption: string;
  span: string;
}

const TILES: ReadonlyArray<Inspiration> = [
  {
    src: '/images/collections/maison.webp',
    alt: 'Intérieur scandinave avec mobilier en bois clair et céramique',
    caption: 'Le salon épuré',
    span: 'sm:col-span-2 sm:row-span-2',
  },
  {
    src: '/images/collections/cadeaux.webp',
    alt: 'Boîte cadeau en kraft avec ficelle de lin',
    caption: 'Pour offrir',
    span: 'sm:col-span-1 sm:row-span-1',
  },
  {
    src: '/images/collections/table.webp',
    alt: 'Table dressée avec vaisselle artisanale et bouquets',
    caption: 'Recevoir',
    span: 'sm:col-span-1 sm:row-span-1',
  },
  {
    src: '/images/hero.webp',
    alt: 'Coin lecture avec plaid en laine et livres',
    caption: 'Le coin lecture',
    span: 'sm:col-span-1 sm:row-span-1',
  },
  {
    src: '/images/collections/cadeaux.webp',
    alt: 'Détail sur un emballage cadeau',
    caption: 'Le détail',
    span: 'sm:col-span-1 sm:row-span-1',
  },
  {
    src: '/images/collections/maison.webp',
    alt: 'Bougies et vases en céramique',
    caption: 'Les essentiels',
    span: 'sm:col-span-2 sm:row-span-1',
  },
];

export function InspirationGrid() {
  return (
    <section
      aria-labelledby="inspiration-title"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <MotionFade>
        <header className="mb-10 max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-700">Inspiration</p>
          <h2
            id="inspiration-title"
            className="mt-2 font-display text-3xl font-medium tracking-tight text-ink-900 sm:text-4xl"
          >
            Ambiances &nbsp;•&nbsp; Objets &nbsp;•&nbsp; Moments
          </h2>
          <p className="mt-3 max-w-xl text-sm text-ink-600 sm:text-base">
            Quelques ambiances pour vous projeter. Toute notre curation se découvre en boutique
            ou en feuilletant le magazine.
          </p>
        </header>
      </MotionFade>

      <ul
        role="list"
        className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:grid-rows-2 sm:grid-flow-row-dense"
      >
        {TILES.map((tile, idx) => (
          <MotionFade
            key={`${tile.src}-${idx}`}
            delay={(idx % 3) * 0.1}
            y={24}
            withScale
            className={tile.span}
          >
            <li className="group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ink-100 sm:aspect-auto sm:h-full">
              <Image
                src={tile.src}
                alt={tile.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 50vw"
                className="object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-110"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/70 via-ink-900/20 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 bottom-0 translate-y-2 px-5 pb-5 pt-12 opacity-90 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-display text-lg font-medium text-white drop-shadow">{tile.caption}</p>
                <p className="mt-1 text-xs text-white/80 sm:opacity-0 sm:transition-opacity sm:duration-500 sm:group-hover:opacity-100">
                  Découvrir →
                </p>
              </div>
            </li>
          </MotionFade>
        ))}
      </ul>
    </section>
  );
}