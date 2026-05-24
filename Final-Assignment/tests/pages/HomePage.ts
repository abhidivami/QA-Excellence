import type { Frame } from '@playwright/test';

export class HomePage {
    constructor(private frame: Frame) {}

    async navigate(origin: string) {
        await this.frame.goto(`${origin}/`, { waitUntil: 'domcontentloaded' });
    }

    async getTitle(): Promise<string> {
        return this.frame.title();
    }

    async getNavCategories(): Promise<string[]> {
        await this.frame.waitForSelector('#top-menu', { timeout: 15000 });
        // Get ALL nav links (includes subcategory links); test checks .toContain for top-level names
        return this.frame.locator('#top-menu a').allTextContents();
    }

    async getCartCount(): Promise<string | null> {
        return this.frame.locator('.header-block__badge').first().textContent();
    }

    async getFeaturedProductCount(): Promise<number> {
        return this.frame.locator('.product-miniature').count();
    }

    async isSearchWidgetVisible(): Promise<boolean> {
        return this.frame.locator('input[name="s"]').isVisible();
    }

    async searchFor(term: string) {
        await this.frame.locator('input[name="s"]').fill(term);
        await this.frame.locator('input[name="s"]').press('Enter');
        await this.frame.waitForLoadState('domcontentloaded');
    }
}
