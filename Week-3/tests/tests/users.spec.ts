import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../fixtures/testData';

test.describe('problem_user — Image Bug', () => {

    test('TC-U-001: standard_user sees unique product images', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.standard.username, users.standard.password);

        const inventoryPage = new InventoryPage(page);
        const srcs = await inventoryPage.getProductImageSrcs();

        const uniqueSrcs = new Set(srcs);
        // All 6 products should have different images
        expect(uniqueSrcs.size).toBe(6);
    });

    test('TC-U-002: problem_user sees same broken image for all products (known bug)', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.problemUser.username, users.problemUser.password);

        const inventoryPage = new InventoryPage(page);
        const srcs = await inventoryPage.getProductImageSrcs();

        const uniqueSrcs = new Set(srcs);
        // BUG: all 6 products show the same image — only 1 unique src instead of 6
        expect(uniqueSrcs.size).toBe(1);
        expect(srcs).toHaveLength(6);
    });

    test('TC-U-003: problem_user can still add to cart despite image bug', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.problemUser.username, users.problemUser.password);

        const inventoryPage = new InventoryPage(page);
        await inventoryPage.addToCart('Sauce Labs Backpack');
        const badge = await inventoryPage.getCartBadgeCount();
        expect(badge).toBe('1');
    });

});

test.describe('performance_glitch_user — Slow Login', () => {

    test('TC-U-004: performance_glitch_user login completes successfully despite delay', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);

        // Login does eventually succeed
        await expect(page).toHaveURL(/inventory/);
    });

    test('TC-U-005: performance_glitch_user login takes noticeably longer than standard_user', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        const start = Date.now();
        await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
        await expect(page).toHaveURL(/inventory/);
        const duration = Date.now() - start;

        // Login takes 3-5 seconds — a standard user login completes in under 1 second
        expect(duration).toBeGreaterThan(2000);
    });

});
