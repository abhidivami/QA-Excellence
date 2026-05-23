import { Page } from '@playwright/test';

export class CheckoutPage {
    constructor(private page: Page) {}

    async getTitle(): Promise<string | null> {
        return this.page.locator('.title').textContent();
    }

    async fillShippingInfo(firstName: string, lastName: string, postalCode: string) {
        await this.page.getByPlaceholder('First Name').fill(firstName);
        await this.page.getByPlaceholder('Last Name').fill(lastName);
        await this.page.getByPlaceholder('Zip/Postal Code').fill(postalCode);
    }

    async continue() {
        await this.page.getByRole('button', { name: 'Continue' }).click();
    }

    async getErrorMessage(): Promise<string | null> {
        return this.page.locator('[data-test="error"]').textContent();
    }

    async getOverviewTitle(): Promise<string | null> {
        return this.page.locator('.title').textContent();
    }

    async finish() {
        await this.page.getByRole('button', { name: 'Finish' }).click();
    }
}
