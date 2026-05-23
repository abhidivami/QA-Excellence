import { Page } from '@playwright/test';

export class CartPage {
    constructor(private page: Page) {}

    async getTitle(): Promise<string | null> {
        return this.page.locator('.title').textContent();
    }

    async getCartItems(): Promise<number> {
        return this.page.locator('.cart_item').count();
    }

    async getCartItemNames(): Promise<string[]> {
        return this.page.locator('.inventory_item_name').allTextContents();
    }

    async proceedToCheckout() {
        await this.page.getByRole('button', { name: 'Checkout' }).click();
    }

    async continueShopping() {
        await this.page.getByRole('button', { name: 'Continue Shopping' }).click();
    }
}
