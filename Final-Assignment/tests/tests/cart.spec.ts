import { test, expect } from '../fixtures/storeFixtures';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { products } from '../fixtures/testData';
import { clearCart } from '../helpers/cartUtils';

test.describe('Cart', () => {

    test.beforeEach(async ({ store, storeOrigin }) => {
        await clearCart(store, storeOrigin);

        // Add exactly one product for each cart test
        const productPage = new ProductPage(store);
        await productPage.navigateToCategory(storeOrigin, products.category);
        await productPage.clickFirstProduct();
        await store.waitForLoadState('domcontentloaded');
        await productPage.addToCart();
        await productPage.closeCartModal();

        // Navigate to cart page
        const cartPage = new CartPage(store);
        await cartPage.navigate(storeOrigin);
    });

    test('TC-CA-001: cart page shows the added product', async ({ store }) => {
        const cartPage = new CartPage(store);
        const itemCount = await cartPage.getCartItemCount();
        expect(itemCount).toBeGreaterThan(0);
    });

    test('TC-CA-002: cart shows product name and order total', async ({ store }) => {
        const cartPage = new CartPage(store);
        const name = await cartPage.getFirstItemName();
        const total = await cartPage.getOrderTotal();

        expect(name?.trim().length).toBeGreaterThan(0);
        expect(total?.trim()).toMatch(/€/);
    });

    test('TC-CA-003: product can be removed from cart', async ({ store, storeOrigin }) => {
        const cartPage = new CartPage(store);
        await cartPage.removeFirstItem();

        const empty = await cartPage.isCartEmpty();
        expect(empty).toBe(true);
    });

    test('TC-CA-004: checkout button is visible in cart', async ({ store }) => {
        const checkoutBtn = store.locator('a[href*="/order"]').first();
        await expect(checkoutBtn).toBeVisible();
    });

    test('TC-CA-005: clicking checkout navigates to checkout page', async ({ store }) => {
        const cartPage = new CartPage(store);
        await cartPage.proceedToCheckout();

        await store.waitForLoadState('domcontentloaded');
        // Works with both clean URLs (/en/order) and legacy (?controller=order)
        expect(store.url()).toMatch(/controller=order|\/order/);
    });

});
