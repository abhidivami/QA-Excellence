import type { Frame } from '@playwright/test';

export class CheckoutPage {
    constructor(private frame: Frame) {}

    async isPersonalInfoStepVisible(): Promise<boolean> {
        // Hummingbird uses tabs; check for the heading or the standard step ID
        return this.frame.locator('#checkout-personal-information-step, h1:has-text("Personal Information"), [aria-label="Your personal information"]').first().isVisible();
    }

    async fillPersonalInfo(firstName: string, lastName: string, email: string) {
        await this.frame.locator('#field-firstname').first().fill(firstName);
        await this.frame.locator('#field-lastname').first().fill(lastName);
        // Hummingbird checkout has two #field-email (guest form + sign-in tab); target first (guest)
        await this.frame.locator('#field-email').first().fill(email);

        // Accept required terms & conditions checkbox (required in PS8 Hummingbird checkout step 1)
        const termsCheck = this.frame.getByRole('checkbox', { name: /I agree to the terms/i });
        if (await termsCheck.count() > 0 && !await termsCheck.isChecked()) {
            await termsCheck.check();
        }

        // Accept optional marketing opt-in checkbox
        const optinCheck = this.frame.locator('#field-optin');
        if (await optinCheck.isVisible()) {
            if (!await optinCheck.isChecked()) await optinCheck.check();
        }

        // Accept required GDPR customer data privacy checkbox
        const privacyConsent = this.frame.getByRole('checkbox', { name: /customer data privacy/i });
        if (await privacyConsent.count() > 0 && !await privacyConsent.isChecked()) {
            await privacyConsent.check();
        }
    }

    async getPersonalInfoError(): Promise<string | null> {
        return this.frame.locator('#customer-form .form-control-comment, .alert-danger').first().textContent();
    }

    async continuePersonalInfo() {
        await this.frame.locator('button[name="continue"]').first().click().catch(() =>
            this.frame.getByRole('button', { name: 'Continue' }).first().click()
        );
        // Give Hummingbird's AJAX step transition time to complete (up to 8s)
        await this.frame.locator('#field-address1, #checkout-addresses-step')
            .first()
            .waitFor({ state: 'visible', timeout: 8000 })
            .catch(() => {});
    }

    async isAddressStepVisible(): Promise<boolean> {
        return this.frame.locator('#checkout-addresses-step, #field-address1').first().isVisible();
    }

    async fillAddress(address: string, city: string, postalCode: string, phone: string) {
        await this.frame.locator('#field-address1').fill(address);
        await this.frame.locator('#field-city').fill(city);
        await this.frame.locator('#field-postcode').fill(postalCode);

        const phoneField = this.frame.locator('#field-phone');
        if (await phoneField.isVisible()) {
            await phoneField.fill(phone);
        }
    }

    async continueAddress() {
        await this.frame.locator('button[name="confirm-addresses"]').click();
        await this.frame.locator('#checkout-delivery-step')
            .waitFor({ state: 'visible', timeout: 10000 })
            .catch(() => {});
    }

    async isDeliveryStepVisible(): Promise<boolean> {
        return this.frame.locator('#checkout-delivery-step').isVisible();
    }

    async continueDelivery() {
        await this.frame.locator('button[name="confirmDeliveryOption"]').click();
        await this.frame.locator('#checkout-payment-step')
            .waitFor({ state: 'visible', timeout: 10000 })
            .catch(() => {});
    }

    async isPaymentStepVisible(): Promise<boolean> {
        return this.frame.locator('#checkout-payment-step').isVisible();
    }

    async selectBankWirePayment() {
        await this.frame.locator('input[data-module-name="ps_wirepayment"]').check();
    }

    async acceptTermsAndPlaceOrder() {
        const terms = this.frame.locator('#conditions_to_approve\\[terms-and-conditions\\]');
        await terms.check();
        await this.frame.locator('#payment-confirmation button').click();
    }

    async isOrderConfirmed(): Promise<boolean> {
        await this.frame.waitForURL(/order-confirmation/, { timeout: 30000 });
        const body = await this.frame.locator('body').textContent();
        return (body ?? '').toLowerCase().includes('confirmed');
    }
}
