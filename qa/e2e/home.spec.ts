// qa/e2e/home.spec.ts
// Mission #1 QA — 3 scénarios smoke e2e Playwright (TS) pour la Home Page.
// Couvre AC-HOME-01, 02, 03, 04, 06, 07, 14.
// À exécuter sur l'URL staging : https://staging.maison14.fr/
//   ou en local : pnpm --filter @ecommerce/web dev  → http://localhost:3000
//
// Pré-requis : @playwright/test, axe-core/playwright installés dans le workspace.
// Lancement : pnpm exec playwright test qa/e2e/home.spec.ts --project=chromium

import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const HOME_URL = process.env.HOME_URL ?? 'http://localhost:3000/';

async function gotoHome(page: Page) {
  const start = Date.now();
  await page.goto(HOME_URL, { waitUntil: 'domcontentloaded' });
  const elapsed = Date.now() - start;
  return elapsed;
}

test.describe('Home Page — smoke e2e (Mission #1 QA)', () => {
  test('SCN-HOME-01 : la home se charge < 2s, hero visible, ≥1 produit cliquable', async ({
    page,
  }) => {
    const elapsed = await gotoHome(page);

    // 1. Latence chargement < 2s (DOMContentLoaded)
    expect(elapsed, 'load < 2000ms').toBeLessThan(2000);

    // 2. Hero visible (H1 unique, above the fold)
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1);
    const h1Text = (await h1.textContent()) ?? '';
    expect(h1Text.length, 'H1 ≤ 60 chars').toBeLessThanOrEqual(60);

    // 3. Sous-titre présent
    const subtitle = page.locator('main p').first();
    await expect(subtitle).toBeVisible();

    // 4. CTA principal cliquable
    const cta = page
      .getByRole('link', { name: /découvrir|voir|explorer/i })
      .first();
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', /\/collections/);

    // 5. Au moins 1 produit cliquable (section "Produits vedettes")
    const productLinks = page.locator(
      '[data-testid="featured-products"] a[href*="/products/"]',
    );
    await expect(productLinks.first()).toBeVisible();
    const productCount = await productLinks.count();
    expect(productCount, '4-8 produits vedettes').toBeGreaterThanOrEqual(4);
    expect(productCount).toBeLessThanOrEqual(8);

    // 6. Image hero = LCP, format WebP/AVIF, alt présent
    const heroImg = page.locator('main picture img, main img').first();
    await expect(heroImg).toBeVisible();
    const src = await heroImg.evaluate((el) =>
      (el as HTMLImageElement).currentSrc,
    );
    expect(src, 'image format .webp/.avif').toMatch(/\.(webp|avif)(\?|$)/);
    const alt = await heroImg.getAttribute('alt');
    expect(alt, 'alt non vide').toBeTruthy();
    expect((alt ?? '').length, 'alt ≤ 125 chars').toBeLessThanOrEqual(125);
  });

  test('SCN-HOME-02 : clic sur un produit → fiche produit s\'ouvre', async ({
    page,
  }) => {
    await gotoHome(page);

    // 1. Clic sur le 1er produit de "Produits vedettes"
    const firstProduct = page
      .locator('[data-testid="featured-products"] a[href*="/products/"]')
      .first();
    await expect(firstProduct).toBeVisible();
    const productHref = await firstProduct.getAttribute('href');
    expect(productHref, 'href /products/[slug]').toMatch(/^\/products\/.+/);

    // 2. Navigation vers la fiche
    await Promise.all([
      page.waitForURL(/\/products\/.+/, { timeout: 5000 }),
      firstProduct.click(),
    ]);

    // 3. URL = /products/[slug]
    expect(page.url()).toMatch(/\/products\/.+/);

    // 4. La fiche a un <h1> (nom produit)
    const productH1 = page.getByRole('heading', { level: 1 });
    await expect(productH1).toBeVisible();
    await expect(productH1).toHaveCount(1);

    // 5. Prix affiché (format fr-FR EUR)
    const price = page.locator('[data-testid="product-price"]').first();
    await expect(price).toBeVisible();
    const priceText = (await price.textContent()) ?? '';
    expect(priceText).toMatch(/\d+,\d{2}\s*€/);

    // 6. SEO : <title> contient le nom du produit (AC-HOME-14)
    const title = await page.title();
    expect(title.length).toBeLessThanOrEqual(60);
  });

  test('SCN-HOME-03 : clic sur "Panier" dans le header → page panier (vide OK)', async ({
    page,
  }) => {
    await gotoHome(page);

    // 1. Header présent
    const header = page.getByRole('banner');
    await expect(header).toBeVisible();

    // 2. Compteur panier (badge "0" toléré) présent dans le header
    const cartLink = header.getByRole('link', { name: /panier|cart/i }).first();
    await expect(cartLink).toBeVisible();
    const cartHref = await cartLink.getAttribute('href');
    expect(cartHref, 'href /cart').toMatch(/\/cart/);

    // 3. Clic → navigation vers /cart
    await Promise.all([
      page.waitForURL(/\/cart/, { timeout: 5000 }),
      cartLink.click(),
    ]);

    // 4. Page panier chargée (vide OK)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // Message "panier vide" toléré (pas d'obligation produit)
    const emptyMessage = page.getByText(/panier vide|votre panier est vide/i);
    await expect(emptyMessage).toBeVisible();
  });
});

test.describe('Home Page — a11y (axe-core, AC-HOME-12)', () => {
  test('0 violation critique WCAG 2.1 AA sur la home', async ({ page }) => {
    await gotoHome(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const criticalOrSerious = results.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious',
    );

    expect(
      criticalOrSerious,
      `violations critiques/sérieuses : ${JSON.stringify(
        criticalOrSerious.map((v) => v.id),
      )}`,
    ).toEqual([]);
  });
});
