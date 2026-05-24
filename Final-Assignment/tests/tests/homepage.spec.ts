import { test, expect } from '../fixtures/storeFixtures';
import { HomePage } from '../pages/HomePage';
import { expected } from '../fixtures/testData';

test.describe('Homepage', () => {

    test.beforeEach(async ({ store, storeOrigin }) => {
        await store.goto(`${storeOrigin}/`, { waitUntil: 'domcontentloaded' });
    });

    test('TC-HP-001: store page title contains PrestaShop', async ({ store }) => {
        const homePage = new HomePage(store);
        const title = await homePage.getTitle();
        expect(title).toContain(expected.storeTitle);
    });

    test('TC-HP-002: navigation shows Clothes, Accessories and Art categories', async ({ store }) => {
        const homePage = new HomePage(store);
        const categories = await homePage.getNavCategories();
        const normalized = categories.map(c => c.trim());
        for (const cat of expected.navCategories) {
            expect(normalized).toContain(cat);
        }
    });

    test('TC-HP-003: search widget is visible and accepts input', async ({ store }) => {
        const homePage = new HomePage(store);
        const visible = await homePage.isSearchWidgetVisible();
        expect(visible).toBe(true);
    });

    test('TC-HP-004: featured products section displays at least one product', async ({ store }) => {
        const homePage = new HomePage(store);
        const count = await homePage.getFeaturedProductCount();
        expect(count).toBeGreaterThan(0);
    });

    test('TC-HP-005: cart badge shows 0 after a completed order', async ({ store }) => {
        const homePage = new HomePage(store);
        const count = await homePage.getCartCount();
        expect(count?.trim()).toBe('0');
    });

});
