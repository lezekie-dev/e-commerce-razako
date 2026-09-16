import * as React from 'react';
import Link from 'next/link';
import { buttonVariants } from '@ecommerce/ui';
import { cn } from '@ecommerce/ui';

/**
 * Breadcrumbs — Server Component.
 *
 * - Affiche un fil d'Ariane accessible (nav aria-label="Fil d'Ariane").
 * - Le dernier élément est l'élément courant (aria-current="page").
 * - JSON-LD `BreadcrumbList` injecté pour Google.
 * - Pas de séparateur visible entre items (fait en CSS via `[aria-hidden]`).
 *
 * Usage :
 *   <Breadcrumbs items={[{ label: 'Accueil', href: '/' }, { label: 'Produits' }]} />
 */

export interface BreadcrumbItem {
  label: string;
  /** Optionnel : omis sur le dernier item. */
  href?: string;
}

export function Breadcrumbs({ items }: { items: ReadonlyArray<BreadcrumbItem> }): React.ReactElement | null {
  if (items.length === 0) return null;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: `https://maison14.fr${item.href}` } : {}),
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-600">
        <ol role="list" className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: 'link', size: 'sm' }),
                      'h-auto min-h-0 p-0 text-ink-600 hover:text-accent-700',
                    )}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span aria-current={isLast ? 'page' : undefined} className="font-medium text-ink-900">
                    {item.label}
                  </span>
                )}
                {!isLast ? (
                  <span aria-hidden="true" className="text-ink-400">
                    /
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}