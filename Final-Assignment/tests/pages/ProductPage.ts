import type { Frame } from '@playwright/test';

export class ProductPage {
    constructor(private frame: Frame) {}

    async navigateToCategory(origin: string, category: string) {
        await this.frame.goto(`${origin}/`, { waitUntil: 'domcontentloaded' });
        await this.frame.waitForSelector('#top-menu', { timeout: 30000 });
        const slug = category.toLowerCase().replace(/\s+/g, '-');
        const href = await this.frame
            .locator(`#top-menu a[href*="${slug}"]`)
            .first()
            .getAttribute('href');
        if (!href) throw new Error(`Category "${category}" not found in navigation`);
        await this.frame.goto(href, { waitUntil: 'domcontentloaded' });
    }

    async getCategoryProductCount(): Promise<number> {
        return this.frame.locator('.product-miniature').count();
    }

    async clickFirstProduct() {
        await this.frame.locator('.product-miniature').first().waitFor({ state: 'visible', timeout: 20000 });
        // Product URLs end in .html — navigate by href to avoid strict mode violation
        const href = await this.frame
            .locator('.product-miniature')
            .first()
            .locator('a[href*=".html"]')
            .first()
            .getAttribute('href');
        if (!href) throw new Error('No product link found on category page');
        await this.frame.goto(href.split('#')[0], { waitUntil: 'domcontentloaded' });
    }

    async getProductName(): Promise<string | null> {
        return this.frame.locator('h1').first().textContent();
    }

    async getProductPrice(): Promise<boolean> {
        // Price may appear in any of these containers depending on Hummingbird version
        return this.frame.locator('.current-price, .product__prices-block, .product-prices').first().isVisible();
    }

    async isAddToCartVisible(): Promise<boolean> {
        return this.frame.locator('button[data-button-action="add-to-cart"]').first().isVisible();
    }

    async addToCart() {
        await this.frame.locator('button[data-button-action="add-to-cart"]').first().click();
        // Firefox renders the cart modal slower than Chromium on the demo site
        await this.frame.waitForSelector('#blockcart-modal', { timeout: 60000 });
    }

    async getCartModalTitle(): Promise<string | null> {
        return this.frame.locator('.blockcart-modal__title, #blockcart-modal .modal-title').first().textContent();
    }

    async closeCartModal() {
        await this.frame.waitForSelector('#blockcart-modal', { state: 'visible', timeout: 15000 });
        await this.frame.evaluate(() => {
            const btn = document.querySelector('#blockcart-modal [data-bs-dismiss="modal"]') as HTMLElement;
            if (btn) btn.click();
        });
        await this.frame.waitForSelector('#blockcart-modal', { state: 'hidden', timeout: 10000 }).catch(() => {});
    }

    async getCartCount(): Promise<string | null> {
        return this.frame.locator('.header-block__badge').first().textContent();
    }
}
