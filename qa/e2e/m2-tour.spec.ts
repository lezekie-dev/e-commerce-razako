/**
 * M2 Tour — parcours catalogue → fiche produit → panier → drawer
 */

import { test, expect } from '@playwright/test';

const PORT = Number(process.env.PORT ?? 3100);
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

test.describe('M2 — Frontend catalogue + PDP + cart store', () => {
  test.use({ baseURL: BASE_URL });

  test('Tour complet + add to cart réel', async ({ page }, testInfo) => {
    // 1 — Home
    await page.goto('/');
    await expect(page).toHaveTitle(/Maison 14/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/pensés pour durer/);
    await page.screenshot({ path: testInfo.outputPath('01-home.png') });

    await page.evaluate(() => window.scrollBy({ top: 600, behavior: 'instant' }));
    await page.waitForTimeout(800);
    await page.screenshot({ path: testInfo.outputPath('02-home-scroll.png') });

    // 2 — Catalogue
    await page.getByRole('link', { name: /^Découvrir$/i }).first().click();
    await page.waitForURL('**/products');
    await expect(page.getByRole('heading', { level: 1, name: /Le catalogue/ })).toBeVisible();
    await page.waitForSelector('[data-testid="catalog-list"] article', { timeout: 10_000 });
    await expect(page.locator('[data-testid="catalog-list"] article').first()).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('03-catalogue.png') });

    const firstCard = page.locator('[data-testid="catalog-list"] article').first();
    await firstCard.hover();
    await page.waitForTimeout(400);
    await page.screenshot({ path: testInfo.outputPath('04-catalogue-hover.png') });

    // 3 — PDP
    await page.goto('/products/vase-terracotta-lorca');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Vase Terracotta Lorca/);
    await page.screenshot({ path: testInfo.outputPath('05-pdp.png') });

    await page.locator('button:has-text("Mat")').first().click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: testInfo.outputPath('06-pdp-accordion.png') });

    // Add to cart sur PDP
    const pdpAddBtn = page.getByRole('button', { name: /Ajouter au panier/ });
    await pdpAddBtn.click();
    await expect(page.getByText(/Ajouté au panier/)).toBeVisible({ timeout: 4000 });
    await page.screenshot({ path: testInfo.outputPath('07-pdp-add-toast.png') });
    await page.waitForTimeout(1500);

    // 4 — Cart drawer
    await page.locator('button[aria-label^="Panier"]').click();
    await page.waitForTimeout(700);
    await expect(page.getByRole('dialog', { name: /Panier/ })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('08-cart-drawer.png') });

    const drawer = page.getByRole('dialog', { name: /Panier/ });
    await drawer.getByRole('button', { name: /Augmenter la quantité/ }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: testInfo.outputPath('09-cart-qty-2.png') });

    const removeBtn = drawer.getByRole('button', { name: /Retirer/ }).first();
    await removeBtn.click();
    await page.waitForTimeout(300);
    await expect(drawer.getByText(/Votre panier est vide/)).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath('10-cart-empty.png') });

    await drawer.getByRole('button', { name: /Fermer le panier/ }).click();
    await page.waitForTimeout(300);

    // 5 — Mobile
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForLoadState("domcontentloaded");
    await page.screenshot({ path: testInfo.outputPath('11-mobile-home.png') });

    await page.goto('/products');
    await page.waitForTimeout(700);
    await page.screenshot({ path: testInfo.outputPath('12-mobile-catalogue.png') });

    await page.goto('/products/carafe-emaillee-vega');
    await page.waitForTimeout(700);
    await page.screenshot({ path: testInfo.outputPath('13-mobile-pdp.png') });
  });
});
