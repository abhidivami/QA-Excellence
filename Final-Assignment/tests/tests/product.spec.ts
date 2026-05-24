import { test, expect } from '../fixtures/storeFixtures';
import { ProductPage } from '../pages/ProductPage';
import { products } from '../fixtures/testData';
import { clearCart } from '../helpers/cartUtils';

test.describe('Product', () => {

    test.beforeEach(async ({ store, storeOrigin }) => {
        await clearCart(store, storeOrigin);
        await store.goto(`${storeOrigin}/`, { waitUntil: 'domcontentloaded' });
    });

    test('TC-PD-001: Clothes category page displays products', async ({ store, storeOrigin }) => {
        const productPage = new ProductPage(store);
        await productPage.navigateToCategory(storeOrigin, products.category);
        const count = await productPage.getCategoryProductCount();
        expect(count).toBeGreaterThan(0);
    });

    test('TC-PD-002: product detail page shows name, price and add to cart button', async ({ store, storeOrigin }) => {
        const productPage = new ProductPage(store);
        await productPage.navigateToCategory(storeOrigin, products.category);
        await productPage.clickFirstProduct();

        await store.waitForLoadState('domcontentloaded');
        const name = await productPage.getProductName();
        const priceVisible = await productPage.getProductPrice();
        const addVisible = await productPage.isAddToCartVisible();

        expect(name?.trim().length).toBeGreaterThan(0);
        expect(priceVisible).toBe(true);
        expect(addVisible).toBe(true);
    });

    test('TC-PD-003: adding a product to cart shows confirmation modal', async ({ store, storeOrigin }) => {
        const productPage = new ProductPage(store);
        await productPage.navigateToCategory(storeOrigin, products.category);
        await productPage.clickFirstProduct();
        await store.waitForLoadState('domcontentloaded');

        await productPage.addToCart();
        const modalTitle = await productPage.getCartModalTitle();
        // Modal confirms product was added — exact wording varies by PS version
        expect(modalTitle?.toLowerCase()).toMatch(/added|cart/i);
    });

    test('TC-PD-004: cart count updates to 1 after adding a product', async ({ store, storeOrigin }) => {
        const productPage = new ProductPage(store);
        await productPage.navigateToCategory(storeOrigin, products.category);
        await productPage.clickFirstProduct();
        await store.waitForLoadState('domcontentloaded');

        await productPage.addToCart();
        await productPage.closeCartModal();

        const count = await productPage.getCartCount();
        expect(count?.trim()).toBe('1');
    });

    test('TC-PD-005: adding two products updates cart count to 2', async ({ store, storeOrigin }) => {
        const productPage = new ProductPage(store);

        // First product
        await productPage.navigateToCategory(storeOrigin, products.category);
        await productPage.clickFirstProduct();
        await store.waitForLoadState('domcontentloaded');
        await productPage.addToCart();
        await productPage.closeCartModal();

        // Second product — go back to category and navigate by href (skip first product)
        await productPage.navigateToCategory(storeOrigin, products.category);
        await store.locator('.product-miniature').first().waitFor({ state: 'visible' });
        const secondHref = await store.locator('.product-miniature').nth(1)
            .locator('a[href*=".html"]').first().getAttribute('href');
        if (!secondHref) throw new Error('Second product link not found');
        await store.goto(secondHref.split('#')[0], { waitUntil: 'domcontentloaded' });
        await productPage.addToCart();
        await productPage.closeCartModal();

        const count = await productPage.getCartCount();
        expect(count?.trim()).toBe('2');
    });

});
