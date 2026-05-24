import type { Frame } from '@playwright/test';

/**
 * Removes all items from the cart by repeatedly clicking the Hummingbird
 * delete link until none remain.  Called in beforeEach for Cart and Product
 * suites so each test starts with an empty cart regardless of prior state.
 */
export async function clearCart(store: Frame, storeOrigin: string): Promise<void> {
    await store.goto(`${storeOrigin}/cart`, { waitUntil: 'domcontentloaded' });
    const removeBtns = store.locator('a[href*="delete=1"]');
    let attempts = 0;
    while (await removeBtns.count() > 0 && attempts < 10) {
        await removeBtns.first().click();
        // PrestaShop reloads the cart page after each delete; wait for it to settle
        await store.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
        attempts++;
    }
}
