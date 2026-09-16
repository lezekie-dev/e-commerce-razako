import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumbs } from '../../../components/breadcrumbs';
import { ProductDetail } from '../../../components/product-detail';
import { findProductBySlug, relatedProducts, PRODUCTS, COLLECTIONS } from '../../../lib/products';

/**
 * Page /products/[slug] — Product Detail Page (PDP).
 *
 * Couvre :
 *  - AC-PROD-01 : affichage fiche (nom, prix, galerie, variantes, description, CTA)
 *  - AC-PROD-02 : selection de variante (sous-delegue a ProductDetail Client)
 *  - AC-PROD-03 : ajout au panier (sous-delegue a AddToCartButton)
 *  - AC-PROD-05 : galerie cliquable (sous-delegue a ProductGallery Client)
 *  - AC-PROD-06 : zoom / swipe (sous-delegue a ProductGallery Client)
 *  - AC-HOME-13 : landmarks, h1 unique
 *  - AC-NFR-01 : LCP image priority
 *
 * Server Component (sauf le sous-arbre interactif).
 */

// Pre-render les slugs connus au build time (M3 branchera ISR).
export function generateStaticParams(): Array<{ slug: string }> {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const product = findProductBySlug(params.slug);
  if (!product) return { title: 'Produit introuvable' };
  return {
    title: product.name,
    description: product.shortDescription,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      url: `/products/${product.slug}`,
      type: 'website',
      images: product.gallery?.length ? [{ url: product.gallery[0]?.url ?? product.image }] : product.image ? [{ url: product.image }] : [],
    },
  };
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = findProductBySlug(params.slug);
  if (!product) {
    notFound();
  }

  const related = relatedProducts(params.slug, 4);
  const breadcrumbItems = [
    { label: 'Accueil', href: '/' },
    { label: 'Catalogue', href: '/products' },
    { label: product.category },
    { label: product.name },
  ];

  return (
    <main id="main" className="bg-white text-ink-900">
      <section
        aria-labelledby="product-title"
        className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:px-8 lg:pb-24 lg:pt-12"
      >
        <Breadcrumbs items={breadcrumbItems} />

        <ProductDetail product={product} related={related} />
      </section>
    </main>
  );
}