import { Page } from '@playwright/test';

export class CheckoutCompletePage {
    constructor(private page: Page) {}

    async getConfirmationHeader(): Promise<string | null> {
        return this.page.locator('.complete-header').textContent();
    }

    async getConfirmationText(): Promise<string | null> {
        return this.page.locator('.complete-text').textContent();
    }

    async backToHome() {
        await this.page.getByRole('button', { name: 'Back Home' }).click();
    }
}
