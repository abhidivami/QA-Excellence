import { test, expect } from '../fixtures/storeFixtures';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { products, customer } from '../fixtures/testData';

async function addProductAndGoToCheckout(store: any, storeOrigin: string) {
    const productPage = new ProductPage(store);
    await productPage.navigateToCategory(storeOrigin, products.category);
    await productPage.clickFirstProduct();
    await store.waitForLoadState('domcontentloaded');
    await productPage.addToCart();
    await productPage.closeCartModal();

    const cartPage = new CartPage(store);
    await cartPage.navigate(storeOrigin);
    await cartPage.proceedToCheckout();
    await store.waitForLoadState('domcontentloaded');
}

test.describe('Checkout', () => {

    test('TC-CO-001: checkout page loads and shows personal info step', async ({ store, storeOrigin }) => {
        await addProductAndGoToCheckout(store, storeOrigin);
        const checkoutPage = new CheckoutPage(store);
        const visible = await checkoutPage.isPersonalInfoStepVisible();
        expect(visible).toBe(true);
    });

    test('TC-CO-002: personal info form has firstname, lastname and email fields', async ({ store, storeOrigin }) => {
        await addProductAndGoToCheckout(store, storeOrigin);

        await expect(store.locator('#field-firstname').first()).toBeVisible();
        await expect(store.locator('#field-lastname').first()).toBeVisible();
        // Hummingbird has two #field-email (guest + sign-in tabs); check the first (guest form)
        await expect(store.locator('#field-email').first()).toBeVisible();
    });

    test('TC-CO-003: submitting empty personal info does not advance the form', async ({ store, storeOrigin }) => {
        await addProductAndGoToCheckout(store, storeOrigin);

        const checkoutPage = new CheckoutPage(store);
        await checkoutPage.continuePersonalInfo();
        await store.waitForTimeout(1000);

        // Hummingbird uses HTML5 native validation; form should NOT advance to address step
        const addressVisible = await checkoutPage.isAddressStepVisible();
        expect(addressVisible).toBe(false);
    });

    test('TC-CO-004: address step appears after completing personal info', async ({ store, storeOrigin }) => {
        await addProductAndGoToCheckout(store, storeOrigin);

        const checkoutPage = new CheckoutPage(store);
        await checkoutPage.fillPersonalInfo(customer.firstName, customer.lastName, customer.email);
        await checkoutPage.continuePersonalInfo();

        const addressVisible = await checkoutPage.isAddressStepVisible();
        expect(addressVisible).toBe(true);
    });

    test('TC-CO-005: full guest checkout flow completes with order confirmation', async ({ store, storeOrigin }) => {
        test.setTimeout(420000); // full e2e checkout needs more time on the demo site
        await addProductAndGoToCheckout(store, storeOrigin);

        const checkoutPage = new CheckoutPage(store);

        // Step 1 — personal info
        await checkoutPage.fillPersonalInfo(customer.firstName, customer.lastName, customer.email);
        await checkoutPage.continuePersonalInfo();

        // Step 2 — address
        await checkoutPage.isAddressStepVisible();
        await checkoutPage.fillAddress(
            customer.address,
            customer.city,
            customer.postalCode,
            customer.phone
        );
        await checkoutPage.continueAddress();

        // Step 3 — delivery
        await checkoutPage.isDeliveryStepVisible();
        await checkoutPage.continueDelivery();

        // Step 4 — payment
        await checkoutPage.isPaymentStepVisible();
        await checkoutPage.selectBankWirePayment();
        await checkoutPage.acceptTermsAndPlaceOrder();

        // Verify confirmation
        const confirmed = await checkoutPage.isOrderConfirmed();
        expect(confirmed).toBe(true);
    });

});
