import type { Metadata } from 'next';
import { Breadcrumbs } from '../../components/breadcrumbs';
import { PanierContent } from './panier-content';
import { findFeaturedProducts } from '../../lib/catalog';

/**
 * Page /panier — Server Component (RSC).
 *
 * - Metadata specifique (title, description, robots noindex pour panier vide).
 * - Breadcrumb Accueil > Panier + JSON-LD BreadcrumbList.
 * - Delegue le rendu interactif a <PanierContent> (Client Component).
 *
 * AC couverts : AC-CART-01 (vue complete), AC-CART-02 (qty stepper), AC-CART-03 (remove),
 * AC-CART-04 (gift wrap), AC-CART-05 (code promo), AC-CART-06 (subtotal shipping total),
 * AC-CART-07 (empty state), AC-CART-08 (cross-sell).
 */

export const metadata: Metadata = {
  title: 'Votre panier',
  description:
    "Consultez les articles de votre panier, appliquez un code promo et passez à la commande en quelques clics.",
  robots: { index: false, follow: true },
};

export default function PanierPage(): React.ReactElement {
  const featured = findFeaturedProducts().slice(0, 4);

  return (
    <div className="bg-ink-50/40">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
        <Breadcrumbs
          items={[
            { label: 'Accueil', href: '/' },
            { label: 'Panier' },
          ]}
        />
        <div className="mt-6">
          <PanierContent featured={featured} />
        </div>
      </div>
    </div>
  );
}