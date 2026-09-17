/**
 * M2-Enhanced Tour — toutes les nouvelles expériences visuelles
 *
 * Couvre :
 * 1. Hero avec mesh-gradient + cursor spotlight + floating orbs + scroll progress bar
 * 2. Stats count-up animation
 * 3. Magnetic CTA hover
 * 4. ProductCard 3D tilt sur hover
 * 5. Catalog filter pill sliding indicator
 * 6. PDP add-to-cart avec toast + bounce
 * 7. Cart drawer avec progress bar livraison gratuite + 🎉 confetti quand seuil atteint
 * 8. Quantity stepper micro-bounce
 * 9. Newsletter submit flow (idle → loading → success)
 * 10. Mobile viewport responsive
 */

import { test, expect, type Page } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3200);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

test.describe('M2 Enhanced — expérience premium', () => {
  test.use({ baseURL: BASE_URL });

  test('Tour complet des nouvelles expériences visuelles', async ({ page }, testInfo) => {
    // ─────────── 1. Home ───────────
    await page.goto('/');
    await expect(page).toHaveTitle(/Maison 14/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/pensés pour durer/);
    await page.waitForTimeout(1800);
    await page.screenshot({ path: testInfo.outputPath('01-home-hero.png') });

    // Move mouse to hero pour déclencher le cursor spotlight
    await page.mouse.move(700, 400);
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath('02-home-spotlight.png') });

    // Scroll progress bar visible
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'instant' }));
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath('03-home-scrolled.png') });

    // Scroll vers featured products
    await page.evaluate(() => window.scrollBy({ top: 900, behavior: 'instant' }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: testInfo.outputPath('04-featured-products.png') });

    // Hover sur un ProductCard pour déclencher 3D tilt + shimmer + quick-add
    const card = page.locator('[data-testid="featured-products"] article').first();
    await card.scrollIntoViewIfNeeded();
    await card.hover({ position: { x: 80, y: 80 } });
    await page.waitForTimeout(800);
    await page.screenshot({ path: testInfo.outputPath('05-product-card-tilt.png') });

    // Quick-add click (force pour bypasser l'overlay du lien)
    const quickAdd = card.getByRole('button', { name: /Ajouter/ }).first();
    await quickAdd.click({ force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: testInfo.outputPath('06-product-card-added.png') });

    // ─────────── 2. Catalogue ───────────
    await page.goto('/products');
    await expect(page.getByRole('heading', { level: 1, name: /Le catalogue/ })).toBeVisible();
    await page.waitForSelector('[data-testid="catalog-list"] article', { timeout: 10_000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: testInfo.outputPath('07-catalog.png') });

    // Hover ProductCard dans le catalogue → tilt + shimmer
    const catCard = page.locator('[data-testid="catalog-list"] article').first();
    await catCard.hover({ position: { x: 80, y: 80 } });
    await page.waitForTimeout(700);
    await page.screenshot({ path: testInfo.outputPath('08-catalog-card-hover.png') });

    // Click on filter "Art de vivre" — sliding pill indicator should animate
    const filterBtn = page.getByTestId('filter-Art de vivre').first();
    if (await filterBtn.count()) {
      await filterBtn.click({ force: true });
      await page.waitForTimeout(800);
      await page.screenshot({ path: testInfo.outputPath('09-catalog-filtered.png') });
    }

    // Reset
    const allBtn = page.getByTestId('filter-all').first();
    if (await allBtn.count()) {
      await allBtn.click({ force: true });
      await page.waitForTimeout(700);
    }

    // ─────────── 3. PDP ───────────
    await page.goto('/products/vase-terracotta-lorca');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Vase Terracotta Lorca/);
    await page.waitForTimeout(800);
    await page.screenshot({ path: testInfo.outputPath('10-pdp.png') });

    // Add to cart sur PDP
    const pdpAddBtn = page.getByRole('button', { name: /Ajouter au panier/ });
    if (await pdpAddBtn.count()) {
      await pdpAddBtn.click({ force: true });
      await page.waitForTimeout(1100);
      await page.screenshot({ path: testInfo.outputPath('11-pdp-add-toast.png') });
    }

    // ─────────── 4. Cart drawer ───────────
    await page.locator('button[aria-label^="Panier"]').click();
    await page.waitForTimeout(800);
    const drawer = page.getByRole('dialog', { name: /Panier/ });
    await expect(drawer).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('12-cart-drawer.png') });

    // Increment quantity → bounce animation
    const inc = drawer.getByRole('button', { name: /Augmenter/ }).first();
    await inc.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: testInfo.outputPath('13-cart-qty-bounce.png') });

    // Click encore pour déclencher possiblement le confetti si on atteint le seuil
    for (let i = 0; i < 4; i++) {
      await inc.click({ force: true });
      await page.waitForTimeout(280);
    }
    await page.screenshot({ path: testInfo.outputPath('14-cart-qty-high.png') });

    // ─────────── 5. Mobile viewport ───────────
    await drawer.getByRole('button', { name: /Fermer/ }).click();
    await page.waitForTimeout(400);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: testInfo.outputPath('15-mobile-home.png') });

    await page.evaluate(() => window.scrollBy({ top: 1000, behavior: 'instant' }));
    await page.waitForTimeout(900);
    await page.screenshot({ path: testInfo.outputPath('16-mobile-products.png') });

    // Engagement cards on mobile
    await page.evaluate(() => window.scrollBy({ top: 1500, behavior: 'instant' }));
    await page.waitForTimeout(900);
    await page.screenshot({ path: testInfo.outputPath('17-mobile-engagements.png') });
  });

  test('Newsletter submit flow', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(1000);
    await page.screenshot({ path: testInfo.outputPath('18-newsletter.png') });

    const emailInput = page.locator('#newsletter-email');
    await emailInput.fill('test@maison14.fr');
    await page.screenshot({ path: testInfo.outputPath('19-newsletter-filled.png') });

    await page.getByRole('button', { name: /S’inscrire/ }).click();
    await page.waitForTimeout(800); // loading state
    await page.screenshot({ path: testInfo.outputPath('20-newsletter-loading.png') });

    await page.waitForTimeout(1200); // success state
    await page.screenshot({ path: testInfo.outputPath('21-newsletter-success.png') });
  });

  test('Inspiration masonry grid + footer', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.evaluate(() => window.scrollBy({ top: 2400, behavior: 'instant' }));
    await page.waitForTimeout(1200);
    await page.screenshot({ path: testInfo.outputPath('22-inspiration-grid.png') });

    // Scroll to footer
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(700);
    await page.screenshot({ path: testInfo.outputPath('23-footer.png') });
  });
});