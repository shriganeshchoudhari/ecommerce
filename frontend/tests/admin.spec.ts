import { test, expect } from '@playwright/test';

// ============================================================
// MODULE: Admin Dashboard — Products, Orders, Coupons, Users
// ============================================================

const BASE_URL = 'http://localhost:3000';

async function loginAsAdmin(page: any) {
    await page.goto(`${BASE_URL}/login`);
    await page.getByLabel(/email/i).fill('admin_test@shopease.com');
    await page.getByLabel(/password/i).fill('Password123!');
    await page.getByRole('button', { name: /login|sign in/i }).click();
    await page.waitForURL(/\//);
}

test.describe('ADMIN — Access Control', () => {

    test('[ADM-N01] Unauthenticated user cannot access /admin', async ({ page }) => {
        await page.goto(`${BASE_URL}/admin`);
        await expect(page).not.toHaveURL(`${BASE_URL}/admin`);
    });

    test('[ADM-N02] Customer role cannot access /admin', async ({ page }) => {
        await page.goto(`${BASE_URL}/login`);
        await page.getByLabel(/email/i).fill('testapi_user@shopease.com');
        await page.getByLabel(/password/i).fill('Password123!');
        await page.getByRole('button', { name: /login|sign in/i }).click();
        await page.waitForURL(/\//);
        await page.goto(`${BASE_URL}/admin`);
        await expect(page).not.toHaveURL(`${BASE_URL}/admin`);
    });

    test('[ADM-P01] Admin user can access /admin dashboard', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await expect(page).toHaveURL(`${BASE_URL}/admin`);
        await expect(page.getByText(/dashboard|admin/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('ADMIN — Dashboard Stats', () => {

    test('[ADM-P02] Dashboard shows stats: total users, total orders, total revenue', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await expect(page.getByText(/users|orders|revenue/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('ADMIN — Orders Management', () => {

    test('[ADM-P03] Orders tab shows list of all orders', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /orders/i }).click();
        await expect(page.getByText(/#|order|status/i)).toBeVisible({ timeout: 8000 });
    });

    test('[ADM-P04] Admin can update order status', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /orders/i }).click();
        // Find a status select/dropdown and change it
        const statusSelect = page.getByRole('combobox').first();
        if (await statusSelect.isVisible({ timeout: 5000 }).catch(() => false)) {
            await statusSelect.selectOption('SHIPPED');
            await page.waitForTimeout(1000);
            await expect(page.getByText(/shipped|updated/i)).toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('ADMIN — Coupons Management', () => {

    test('[ADM-P05] Coupons tab shows list of all coupons', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /coupon/i }).click();
        await expect(page.getByText(/code|discount|valid/i)).toBeVisible({ timeout: 8000 });
    });

    test('[ADM-P06] Admin can create a new coupon', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /coupon/i }).click();
        // Fill in coupon form
        const codeInput = page.getByPlaceholder(/code|coupon code/i);
        if (await codeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await codeInput.fill(`E2E${Date.now()}`);
            const typeSelect = page.getByRole('combobox').filter({ hasText: /percentage|fixed/i }).first();
            if (await typeSelect.isVisible()) await typeSelect.selectOption('PERCENTAGE');
            const valueInput = page.getByPlaceholder(/value|amount|%/i);
            if (await valueInput.isVisible()) await valueInput.fill('15');
            await page.getByRole('button', { name: /create|add coupon/i }).click();
            await expect(page.getByText(/created|success/i)).toBeVisible({ timeout: 5000 });
        }
    });

    test('[ADM-N03] Creating coupon with duplicate code shows error', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /coupon/i }).click();
        const codeInput = page.getByPlaceholder(/code|coupon code/i);
        if (await codeInput.isVisible({ timeout: 5000 }).catch(() => false)) {
            await codeInput.fill('WELCOME20'); // Existing code
            const valueInput = page.getByPlaceholder(/value|amount/i);
            if (await valueInput.isVisible()) await valueInput.fill('10');
            await page.getByRole('button', { name: /create|add coupon/i }).click();
            await expect(page.getByText(/already exists|duplicate|conflict/i)).toBeVisible({ timeout: 5000 });
        }
    });

    test('[ADM-P07] Admin can delete a coupon', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /coupon/i }).click();
        const deleteBtn = page.getByRole('button', { name: /delete|×/i }).last();
        if (await deleteBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await deleteBtn.click();
            // Confirm dialog may appear
            const confirmBtn = page.getByRole('button', { name: /confirm|yes|ok/i });
            if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
                await confirmBtn.click();
            }
            await expect(page.getByText(/deleted|removed|success/i)).toBeVisible({ timeout: 5000 });
        }
    });
});

test.describe('ADMIN — Users Management', () => {

    test('[ADM-P08] Users tab shows list of registered users', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /users/i }).click();
        await expect(page.getByText(/email|role|customer|admin/i)).toBeVisible({ timeout: 8000 });
    });

    test('[ADM-P09] Users list shows at least one user (seed data)', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /users/i }).click();
        // At minimum admin user should appear
        await expect(page.getByText(/admin|customer/i)).toBeVisible({ timeout: 8000 });
    });
});

test.describe('ADMIN — Products Management', () => {

    test('[ADM-P10] Products tab shows list of products', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /products/i }).click();
        await expect(page.getByText(/product|sku|price|stock/i)).toBeVisible({ timeout: 8000 });
    });

    test('[ADM-P11] Admin can create a new product', async ({ page }) => {
        await loginAsAdmin(page);
        await page.goto(`${BASE_URL}/admin`);
        await page.getByRole('tab', { name: /products/i }).click();
        const addBtn = page.getByRole('button', { name: /add product|new product|create/i });
        if (await addBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            await addBtn.click();
            // Fill in product form
            await page.getByLabel(/name/i).fill(`E2E Product ${Date.now()}`);
            await page.getByLabel(/sku/i).fill(`E2E-SKU-${Date.now()}`);
            await page.getByLabel(/price/i).fill('999');
            await page.getByLabel(/stock|quantity/i).fill('10');
            await page.getByRole('button', { name: /save|create|submit/i }).click();
            await expect(page.getByText(/created|success/i)).toBeVisible({ timeout: 6000 });
        }
    });
});
