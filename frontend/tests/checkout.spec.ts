import { test, expect } from '@playwright/test';

test.describe('E2E Checkout Flow', () => {
    test('should allow a guest to browse products and see login prompt on cart', async ({ page }) => {
        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('requestfailed', request => console.log('FAILED REQUEST:', request.url(), request.failure()?.errorText));
        page.on('response', response => {
            if (response.status() >= 400) {
                console.log(`HTTP ERROR: ${response.url()} ${response.status()}`);
            }
        });

        // 1. Go to Home Page
        await page.goto('/');
        await expect(page).toHaveTitle(/ShopEase/);

        // 2. Go to Products Page
        await page.getByRole('link', { name: 'Shop', exact: true }).first().click();
        await expect(page).toHaveURL(/.*\/products/);

        // 3. Wait for real product to load and select it
        await page.waitForSelector('.grid.grid-cols-1');
        const firstProduct = page.locator('.grid.grid-cols-1 > div').first();
        await expect(firstProduct).toBeVisible();
        await expect(page.locator('text=Real Test Product').first()).toBeVisible();

        // Click on the product link to view details
        await firstProduct.locator('a').first().click();
        await expect(page).toHaveURL(/.*\/products\/1/);

        // 4. In Product detail page, Add to Cart
        const addToCartBtn = page.getByRole('button', { name: /Add to Cart/i });
        await addToCartBtn.waitFor({ state: 'visible', timeout: 10000 });
        await addToCartBtn.click();

        // 5. Go to Cart via header icon
        const cartButton = page.locator('header a[href="/cart"]').first();
        await cartButton.waitFor({ state: 'visible', timeout: 5000 });
        await cartButton.click();
        await expect(page).toHaveURL(/.*\/cart/);

        // In our app, if the user is unauthenticated, the cart page will show "Please login to view your cart"
        await expect(page.locator('text=Please login to view your cart')).toBeVisible({ timeout: 10000 });
    });
});
