import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { users, products, checkout, expected } from '../fixtures/testData';

test.describe('Inventory', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.standard.username, users.standard.password);
    });

    test('TC-C-001: inventory page shows Products title', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const title = await inventoryPage.getTitle();
        expect(title).toBe(expected.inventoryTitle);
    });

    test('TC-C-002: inventory page displays 6 products', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const count = await inventoryPage.getProductCount();
        expect(count).toBe(6);
    });

    test('TC-C-003: sort dropdown is present on inventory page', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const sortDropdown = await inventoryPage.getSortOptions();
        await expect(sortDropdown).toBeVisible();
    });

});

test.describe('Add to Cart', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.standard.username, users.standard.password);
    });

    test('TC-C-004: adding one product updates cart badge to 1', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.addToCart(products.backpack);
        const badge = await inventoryPage.getCartBadgeCount();
        expect(badge).toBe('1');
    });

    test('TC-C-005: adding two products updates cart badge to 2', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.addToCart(products.bikeLight);
        const badge = await inventoryPage.getCartBadgeCount();
        expect(badge).toBe('2');
    });

    test('TC-C-006: cart page shows added product', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();

        const itemNames = await cartPage.getCartItemNames();
        expect(itemNames).toContain(products.backpack);
    });

    test('TC-C-007: cart page title is correct', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();

        const title = await cartPage.getTitle();
        expect(title).toBe(expected.cartTitle);
    });

});

test.describe('Checkout Flow', () => {

    test.beforeEach(async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.standard.username, users.standard.password);
    });

    test('TC-C-008: checkout information page has correct title', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();

        const title = await checkoutPage.getTitle();
        expect(title).toBe(expected.checkoutTitle);
    });

    test('TC-C-009: checkout overview shows after filling form', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo(checkout.firstName, checkout.lastName, checkout.postalCode);
        await checkoutPage.continue();

        const title = await checkoutPage.getOverviewTitle();
        expect(title).toBe(expected.overviewTitle);
    });

    test('TC-C-010: empty first name on checkout shows error', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo('', checkout.lastName, checkout.postalCode);
        await checkoutPage.continue();

        const error = await checkoutPage.getErrorMessage();
        expect(error).toContain('First Name is required');
    });

    test('TC-C-011: complete checkout shows order confirmation', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);
        const completePage = new CheckoutCompletePage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo(checkout.firstName, checkout.lastName, checkout.postalCode);
        await checkoutPage.continue();
        await checkoutPage.finish();

        const header = await completePage.getConfirmationHeader();
        expect(header).toBe(expected.confirmationHeader);
    });

    test('TC-C-012: order confirmation shows dispatch message', async ({ page }) => {
        const inventoryPage = new InventoryPage(page);
        const cartPage = new CartPage(page);
        const checkoutPage = new CheckoutPage(page);
        const completePage = new CheckoutCompletePage(page);

        await inventoryPage.addToCart(products.backpack);
        await inventoryPage.goToCart();
        await cartPage.proceedToCheckout();
        await checkoutPage.fillShippingInfo(checkout.firstName, checkout.lastName, checkout.postalCode);
        await checkoutPage.continue();
        await checkoutPage.finish();

        const text = await completePage.getConfirmationText();
        expect(text).toContain(expected.confirmationText);
    });

});
