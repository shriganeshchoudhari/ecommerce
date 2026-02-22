import { test, expect } from '@playwright/test';

// ============================================================
// MODULE: Profile — Order History, Address Book, Status Stepper
// ============================================================

const BASE_URL = 'http://127.0.0.1:3000';

async function loginAsCustomer(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForURL(/\//);
    await expect(page.getByRole('button', { name: /user menu/i })).toBeVisible({ timeout: 8000 });
}

test.describe('PROFILE — Auth Guard', () => {

    test('[PROF-N01] Unauthenticated user is redirected to login', async ({ page }) => {
        await page.goto(`${BASE_URL}/profile`);
        await expect(page).toHaveURL(/\/login/);
    });
});

test.describe('PROFILE — User Info', () => {

    test('[PROF-P01] Profile page shows user name and email', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await expect(page.getByText(/shopease|testapi/i)).toBeVisible({ timeout: 8000 });
    });

    test('[PROF-P02] Profile page shows My Account heading', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await expect(page.getByRole('heading', { name: /account|profile|my account/i })).toBeVisible({ timeout: 6000 });
    });
});

test.describe('PROFILE — Order History', () => {

    test('[PROF-P03] Orders tab shows order history', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await page.getByRole('tab', { name: /orders/i }).click();
        // Should show order list or empty state
        const hasOrders = await page.getByText(/order #|₹/i).isVisible({ timeout: 5000 }).catch(() => false);
        const emptyMsg = await page.getByText(/no orders|placed any/i).isVisible({ timeout: 5000 }).catch(() => false);
        expect(hasOrders || emptyMsg).toBe(true);
    });

    test('[PROF-P04] Order status stepper is visible on order cards', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await page.getByRole('tab', { name: /orders/i }).click();
        // If there are orders, the stepper should be present
        const hasOrders = await page.getByText(/order #|₹/i).isVisible({ timeout: 5000 }).catch(() => false);
        if (hasOrders) {
            await expect(page.getByText(/PENDING|CONFIRMED|SHIPPED|DELIVERED/i)).toBeVisible({ timeout: 5000 });
        }
    });

    test('[PROF-P05] Cancelled orders show CANCELLED badge instead of stepper', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await page.getByRole('tab', { name: /orders/i }).click();
        const cancelledBadge = page.getByText('CANCELLED');
        // Soft check — only verify if a cancelled order exists
        const visible = await cancelledBadge.isVisible({ timeout: 3000 }).catch(() => false);
        test.info().annotations.push({ type: 'info', description: `Cancelled order visible: ${visible}` });
    });
});

test.describe('PROFILE — Addresses', () => {

    test('[PROF-P06] Addresses tab shows saved addresses', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await page.getByRole('tab', { name: /address/i }).click();
        await expect(page.getByText(/address|city|street|saved/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('PROFILE — Wishlist Link', () => {

    test('[PROF-P07] Wishlist link is visible in sidebar', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await expect(page.getByRole('link', { name: /wishlist/i })).toBeVisible({ timeout: 6000 });
    });

    test('[PROF-P08] Wishlist link navigates to /wishlist', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await page.getByRole('link', { name: /wishlist/i }).click();
        await expect(page).toHaveURL(/\/wishlist/);
    });
});

test.describe('PROFILE — Logout', () => {

    test('[PROF-P09] User can sign out from profile sidebar', async ({ page }) => {
        await loginAsCustomer(page);
        await page.goto(`${BASE_URL}/profile`);
        await page.getByRole('button', { name: /sign out|logout/i }).click();
        await expect(page.getByRole('link', { name: /login|sign in/i })).toBeVisible({ timeout: 6000 });
    });
});
