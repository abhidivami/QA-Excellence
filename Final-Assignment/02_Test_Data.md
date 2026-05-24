# Test Data — PrestaShop Demo E-Commerce Store

## Environment

| Parameter | Value |
| --------- | ----- |
| Application URL | <https://demo.prestashop.com/> |
| Demo provisioning | Unique shop per browser session via iframe at `*.demo.prestashop.com` |
| Browsers (local) | Chromium (Desktop Chrome) |
| Browsers (CI) | Chromium · Firefox (Desktop Firefox) · WebKit (Desktop Safari) |
| Workers (local) | 1 — Chromium only |
| Workers (CI) | 3 — one per browser project, all running in parallel |
| Viewport | 1280 × 720 (all browsers) |
| Theme | Hummingbird (PrestaShop 8) |

---

## Product Data

| Parameter | Value | Used In |
|-----------|-------|---------|
| Search term (valid) | `Hummingbird` | TC-SR-001, TC-SR-002, TC-SR-003 |
| Search term (no results) | `zzzzzzxxx` | TC-SR-004 |
| Expected product name (partial) | `Hummingbird` | TC-SR-003 |
| Product category | `Clothes` | TC-PD-001 through TC-PD-005, TC-CA-001 through TC-CA-005, TC-CO-001 through TC-CO-005 |
| Default first product | Hummingbird printed t-shirt (S, White) | All product/cart/checkout tests |

---

## Customer Data (Guest Checkout)

| Field | Value | Used In |
|-------|-------|---------|
| First Name | `John` | TC-CO-004, TC-CO-005 |
| Last Name | `Tester` | TC-CO-004, TC-CO-005 |
| Email | `qa.automation.tester@example.com` | TC-CO-004, TC-CO-005 |
| Street Address | `123 Test Street` | TC-CO-005 |
| City | `Paris` | TC-CO-005 |
| Postal Code | `75001` | TC-CO-005 |
| Phone | `0123456789` | TC-CO-005 |
| Country | France (default in demo) | TC-CO-005 |

---

## Expected Values

| Assertion | Value | Used In |
|-----------|-------|---------|
| Page title substring | `PrestaShop` | TC-HP-001 |
| Nav categories present | `Clothes`, `Accessories`, `Art` | TC-HP-002 |
| Cart badge on fresh session | `0` | TC-HP-005 |
| Cart count after 1 product | `1` | TC-PD-004 |
| Cart count after 2 products | `2` | TC-PD-005 |
| Order total currency | `€` (euro) | TC-CA-002 |
| Product URL pattern | `.html` extension | TC-SR-005 |
| Checkout URL pattern | `/order` | TC-CA-005 |
| Order confirmation URL | `order-confirmation` | TC-CO-005 |
| Confirmation text | `confirmed` (case-insensitive) | TC-CO-005 |

---

## Key Selectors Reference

| Element | Selector | Notes |
|---------|----------|-------|
| Cart badge | `.header-block__badge` | Header cart count |
| Product cards | `.product-miniature` | Category and search result pages |
| Product title link | `.product-miniature a[href*=".html"].nth(1)` | 0=image link, 1=title link |
| Add to cart button | `button[data-button-action="add-to-cart"]` | Product detail page |
| Cart modal | `#blockcart-modal` | After adding to cart |
| Modal dismiss | `[data-bs-dismiss="modal"]` | Bootstrap 5 modal close |
| Cart item | `.cart__item` | Cart page |
| Cart item title | `.cart__item a[href*=".html"].nth(1)` | Same nth(1) pattern |
| Cart remove link | `a[href*="delete=1"]` | Hummingbird — direct delete URL |
| Checkout link | `a[href*="/order"]` | Cart page "Proceed to checkout" |
| Search input | `input[name="s"]` | Homepage and all pages |
| Top navigation | `#top-menu a` | Navigation links |
| Category filter | `#top-menu a[href*="clothes"]` | Clothes category link |
| Personal info step | `h1:has-text("Personal Information")` | Checkout step 1 |
| Address field | `#field-address1` | Checkout step 2 |
| Terms checkbox (payment) | `#conditions_to_approve[terms-and-conditions]` | Checkout step 4 |
| Place order button | `#payment-confirmation button` | Checkout step 4 |

---

## Payment Method

| Method | Selector | Notes |
|--------|----------|-------|
| Bank Wire | `input[data-module-name="ps_wirepayment"]` | Default in PS8 demo |

---

## Cart State Management

All Product and Cart test suites call `clearCart()` in `beforeEach` to ensure test isolation. The helper lives in `helpers/cartUtils.ts` and is shared across both suites:

```typescript
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
```

**Why needed:** The worker-scoped fixture shares one browser session across all tests in a spec file. Cart state is server-side in PrestaShop, so it persists between tests unless explicitly cleared. Each of the three browser projects gets its own worker with its own independent demo shop session.
