import type { Frame } from '@playwright/test';

export class SearchPage {
    constructor(private frame: Frame) {}

    async getResultCount(): Promise<number> {
        return this.frame.locator('.product-miniature').count();
    }

    async getFirstResultName(): Promise<string | null> {
        await this.frame.locator('.product-miniature').first().waitFor({ state: 'visible', timeout: 20000 });
        // nth(0) is the image link (wraps <img>, no text); nth(1) is the title link with visible text
        return this.frame.locator('.product-miniature').first()
            .locator('a[href*=".html"]')
            .nth(1)
            .innerText();
    }

    async hasNoResultsMessage(): Promise<boolean> {
        // Hummingbird redirects to homepage when search returns 0 results
        const url = this.frame.url();
        if (!url.includes('search')) return true;
        const text = await this.frame.locator('body').textContent();
        return (text ?? '').toLowerCase().includes('no result') || (text ?? '').toLowerCase().includes('0 result');
    }

    async clickFirstResult() {
        await this.frame.locator('.product-miniature').first().waitFor({ state: 'visible', timeout: 20000 });
        const href = await this.frame
            .locator('.product-miniature')
            .first()
            .locator('a[href*=".html"]')
            .first()
            .getAttribute('href');
        if (!href) throw new Error('No search result product link found');
        await this.frame.goto(href.split('#')[0], { waitUntil: 'domcontentloaded' });
    }

    async getPageUrl(): Promise<string> {
        return this.frame.url();
    }
}
