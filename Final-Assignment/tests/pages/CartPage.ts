import type { Frame } from '@playwright/test';

export class CartPage {
    constructor(private frame: Frame) {}

    async navigate(origin: string) {
        await this.frame.goto(`${origin}/cart`, { waitUntil: 'domcontentloaded' });
    }

    async getCartItemCount(): Promise<number> {
        return this.frame.locator('.cart__item').count();
    }

    async getFirstItemName(): Promise<string | null> {
        await this.frame.locator('.cart__item').first().waitFor({ state: 'visible' });
        // Hummingbird: image link is nth(0), title link is nth(1)
        return this.frame.locator('.cart__item').first()
            .locator('a[href*=".html"]')
            .nth(1)
            .innerText()
            .catch(() => null);
    }

    async getOrderTotal(): Promise<string | null> {
        for (const sel of ['.cart-summary__value', '.order-total .value', '.js-total', '.cart-total-value']) {
            const el = this.frame.locator(sel);
            if (await el.count() > 0) return el.first().textContent();
        }
        // Fallback: extract price near "Total" from cart summary text
        const text = await this.frame.locator('.cart-summary, #js-checkout-summary').first().textContent().catch(() => null);
        const match = text?.match(/Total[^€]*(€[\d.,]+)/);
        return match ? match[1] : null;
    }

    async removeFirstItem() {
        // Hummingbird remove link: <a href="/cart?delete=1&...">Remove</a>
        await this.frame.locator('a[href*="delete=1"]').first().click();
        await this.frame.waitForTimeout(1000);
    }

    async isCartEmpty(): Promise<boolean> {
        const text = await this.frame.locator('body').textContent();
        return (text ?? '').toLowerCase().includes('your cart is empty') ||
               await this.frame.locator('.cart__item').count() === 0;
    }

    async proceedToCheckout() {
        // Navigate by href to avoid click-interception by Hummingbird JS
        await this.frame.locator('a[href*="/order"]').first().waitFor({ state: 'visible' });
        const href = await this.frame.locator('a[href*="/order"]').first().getAttribute('href');
        if (!href) throw new Error('Checkout link href not found');
        await this.frame.goto(href, { waitUntil: 'domcontentloaded' });
    }
}
