import { Page } from '@playwright/test';

export class InventoryPage {
    constructor(private page: Page) {}

    async getTitle(): Promise<string | null> {
        return this.page.locator('.title').textContent();
    }

    async getProductCount(): Promise<number> {
        return this.page.locator('.inventory_item').count();
    }

    async addToCart(productName: string) {
        await this.page
            .locator('.inventory_item')
            .filter({ hasText: productName })
            .getByRole('button', { name: 'Add to cart' })
            .click();
    }

    async getCartBadgeCount(): Promise<string | null> {
        return this.page.locator('.shopping_cart_badge').textContent();
    }

    async goToCart() {
        await this.page.locator('.shopping_cart_link').click();
    }

    async getSortOptions() {
        return this.page.locator('.product_sort_container');
    }

    async getProductImageSrcs(): Promise<string[]> {
        return this.page.locator('.inventory_item img').evaluateAll(
            (imgs) => (imgs as HTMLImageElement[]).map(img => img.src)
        );
    }
}
