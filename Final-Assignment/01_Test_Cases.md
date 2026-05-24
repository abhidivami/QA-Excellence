# Test Cases — PrestaShop Demo E-Commerce Store

**Application Under Test:** PrestaShop 8 (Hummingbird Theme) — <https://demo.prestashop.com/>
**Test Type:** End-to-End Automated (Playwright + TypeScript)
**Total Test Cases:** 25
**Coverage:** Homepage · Search · Product · Cart · Checkout
**Browsers:** Chromium (Desktop Chrome) · Firefox (Desktop Firefox) *(CI only)* · WebKit (Desktop Safari) *(CI only)*

---

## TC-HP — Homepage Tests

| ID | Title | Pre-Conditions | Test Steps | Expected Result |
| -- | ----- | -------------- | ---------- | --------------- |
| TC-HP-001 | Store page title contains PrestaShop | Demo store provisioned and accessible | 1. Navigate to store homepage | Page `<title>` contains "PrestaShop" |
| TC-HP-002 | Navigation shows Clothes, Accessories and Art categories | Homepage loaded | 1. Navigate to homepage<br>2. Read all text from `#top-menu` | Nav menu contains "Clothes", "Accessories", and "Art" |
| TC-HP-003 | Search widget is visible and accepts input | Homepage loaded | 1. Navigate to homepage<br>2. Check `input[name="s"]` visibility<br>3. Type "test" into the field | Search input is visible and accepts text without errors |
| TC-HP-004 | Featured products section displays at least one product | Homepage loaded | 1. Navigate to homepage<br>2. Count `.product-miniature` elements | At least 1 product card is displayed |
| TC-HP-005 | Cart badge shows 0 after completed order | Checkout suite has run; TC-CO-005 placed an order (which clears the server-side cart) | 1. Navigate to homepage<br>2. Read `.header-block__badge` text | Cart badge displays "0" |

---

## TC-SR — Search Tests

| ID | Title | Pre-Conditions | Test Steps | Expected Result |
| -- | ----- | -------------- | ---------- | --------------- |
| TC-SR-001 | Searching for a valid term returns results | Homepage loaded | 1. Navigate to homepage<br>2. Type "Hummingbird" in search<br>3. Press Enter<br>4. Count `.product-miniature` elements | Result count > 0 |
| TC-SR-002 | Search results display product names | Search results page for "Hummingbird" | 1. Search for "Hummingbird"<br>2. Read title link text from first result | Product name is non-empty text |
| TC-SR-003 | Search results contain the searched product name | Search results page for "Hummingbird" | 1. Search for "Hummingbird"<br>2. Get first result name | Result name contains "Hummingbird" (case-insensitive) |
| TC-SR-004 | Searching for a non-existent term shows no results | Homepage loaded | 1. Search for "zzzzzzxxx"<br>2. Check resulting URL and page content | Hummingbird redirects to homepage (URL does not contain "search") **or** page contains a "no results" message |
| TC-SR-005 | Clicking a search result navigates to the product detail page | Search results page | 1. Search for "Hummingbird"<br>2. Navigate via first result's `href`<br>3. Check resulting URL and page content | URL contains ".html" and the add-to-cart button is visible |

---

## TC-PD — Product Tests

| ID | Title | Pre-Conditions | Test Steps | Expected Result |
| -- | ----- | -------------- | ---------- | --------------- |
| TC-PD-001 | Clothes category page displays products | Cart cleared; homepage loaded | 1. Navigate to Clothes category<br>2. Count `.product-miniature` elements | At least 1 product displayed in Clothes category |
| TC-PD-002 | Product detail page shows name, price and add to cart button | Clothes category loaded | 1. Navigate to Clothes category<br>2. Click first product link<br>3. Read `h1`, price, and add-to-cart button visibility | Product name length > 0; price element is visible; "Add to cart" button is visible |
| TC-PD-003 | Adding a product to cart shows confirmation modal | Product detail page loaded | 1. Navigate to Clothes category<br>2. Click first product<br>3. Click "Add to cart" button<br>4. Read `#blockcart-modal` title | Modal title matches `/added\|cart/i` |
| TC-PD-004 | Cart count updates to 1 after adding a product | Cart cleared (0 items) | 1. Clear cart<br>2. Navigate to Clothes category<br>3. Click first product<br>4. Add to cart<br>5. Close modal<br>6. Read `.header-block__badge` | Cart badge shows "1" |
| TC-PD-005 | Adding two products updates cart count to 2 | Cart cleared (0 items) | 1. Clear cart<br>2. Add first product from Clothes category<br>3. Return to Clothes, navigate to second product via href<br>4. Add second product<br>5. Close modal<br>6. Read `.header-block__badge` | Cart badge shows "2" |

---

## TC-CA — Cart Tests

| ID | Title | Pre-Conditions | Test Steps | Expected Result |
| -- | ----- | -------------- | ---------- | --------------- |
| TC-CA-001 | Cart page shows the added product | Cart cleared; product added via beforeEach | 1. Clear cart<br>2. Add product to cart<br>3. Navigate to `/cart`<br>4. Count `.cart__item` elements | Item count > 0 |
| TC-CA-002 | Cart shows product name and order total | Cart cleared; 1 product added; cart page open | 1. Clear cart<br>2. Add product to cart<br>3. Navigate to cart<br>4. Read title link text and total price | Product name length > 0; total contains "€" |
| TC-CA-003 | Product can be removed from cart | Cart cleared; 1 product added; cart page open | 1. Clear cart<br>2. Add product to cart<br>3. Navigate to cart<br>4. Click `a[href*="delete=1"]`<br>5. Check `isCartEmpty()` | Cart is empty (0 `.cart__item` elements or page text includes "your cart is empty") |
| TC-CA-004 | Checkout button is visible in cart | Cart cleared; 1 product added; cart page open | 1. Clear cart<br>2. Add product to cart<br>3. Navigate to cart<br>4. Check visibility of `a[href*="/order"]` | "Proceed to checkout" link is visible |
| TC-CA-005 | Clicking checkout navigates to checkout page | Cart cleared; 1 product added; cart page open | 1. Clear cart<br>2. Add product to cart<br>3. Navigate to cart<br>4. Get `href` from checkout link<br>5. Navigate via `frame.goto(href)` with `waitUntil: 'domcontentloaded'`<br>6. Check `frame.url()` | URL contains "/order" |

---

## TC-CO — Checkout Tests

| ID | Title | Pre-Conditions | Test Steps | Expected Result |
| -- | ----- | -------------- | ---------- | --------------- |
| TC-CO-001 | Checkout page loads and shows personal info step | Cart with 1 product; navigated to checkout | 1. Add product to cart<br>2. Navigate to checkout<br>3. Check `isPersonalInfoStepVisible()` | Personal info heading / step container is visible |
| TC-CO-002 | Personal info form has firstname, lastname and email fields | Checkout page loaded (Personal Info step) | 1. Add product and go to checkout<br>2. Assert `#field-firstname`, `#field-lastname`, `#field-email` are visible | All three fields are visible |
| TC-CO-003 | Submitting empty personal info does not advance the form | Checkout page loaded (Personal Info step) | 1. Add product and go to checkout<br>2. Click "Continue" without filling any fields<br>3. Wait 1 s<br>4. Check `isAddressStepVisible()` | Address step is NOT visible — HTML5 native validation blocks submission |
| TC-CO-004 | Address step appears after completing personal info | Checkout page loaded | 1. Add product and go to checkout<br>2. Fill first name ("John"), last name ("Tester"), email<br>3. Check required consent boxes: Terms & Conditions **and** Customer Data Privacy (GDPR)<br>4. Click "Continue"<br>5. Wait up to 8 s for AJAX transition<br>6. Check `isAddressStepVisible()` | Address form (`#field-address1`) is visible |
| TC-CO-005 | Full guest checkout flow completes with order confirmation | Checkout page loaded | 1. Add product and go to checkout<br>2. Fill personal info + accept Terms & Conditions and Customer Data Privacy → Continue<br>3. Fill street address, city, postal code, phone → Continue<br>4. Confirm delivery option → Continue<br>5. Select Bank Wire payment<br>6. Accept payment terms → Place Order<br>7. Check `isOrderConfirmed()` | URL contains "order-confirmation" **and** page body contains "confirmed" |

---

## Notes

### Browser Coverage

Each test case targets three browsers — **Chromium (Desktop Chrome)**, **Firefox (Desktop Firefox)**, and **WebKit (Desktop Safari)** — bringing the total to **75 test runs** (25 per browser) on every CI push.

**Local runs use Chromium only.** Firefox and WebKit run exclusively in CI (`ubuntu-latest`), where the demo site loads within the 240 s test timeout. On macOS, Firefox's beforeEach chain (5–6 iframe navigations) regularly exceeds that ceiling; WebKit's ARM64 binary crashes with Bus Error on Apple Silicon. Both browsers are configured in `playwright.config.ts` behind `const isCI = !!process.env.CI` and run correctly in the GitHub Actions environment.

In CI, all three browser projects run in parallel (one worker each). The worker-scoped fixture provisions an independent demo shop session per browser, so cart state never leaks across browser projects.

### Cart State Isolation

Cart state is server-side in PrestaShop and persists across tests within the same browser session. All Cart and Product tests call `clearCart()` (shared from `helpers/cartUtils.ts`) in `beforeEach` to guarantee isolation. Checkout tests intentionally accumulate cart items across TC-CO-001 → TC-CO-005 instead of clearing, because each test adds a fresh product and navigates to checkout; TC-CO-005 then places an order which clears the cart.

### TC-HP-005 Dependency

TC-HP-005 checks that the cart badge shows "0". It relies on TC-CO-005 completing a full order in the same browser session, which causes PrestaShop to empty the server-side cart. Tests run in alphabetical spec-file order (`cart` → `checkout` → `homepage` → `product` → `search`), so this dependency is always satisfied within each browser's worker.

### Checkout GDPR Checkboxes

PrestaShop 8 requires **two** consent checkboxes on the Personal Information step before the form will submit:

1. **Terms and Conditions** — matched via `getByRole('checkbox', { name: /I agree to the terms/i })`
2. **Customer Data Privacy** — matched via `getByRole('checkbox', { name: /customer data privacy/i })`

Both are handled inside `fillPersonalInfo()` in `CheckoutPage.ts`. A marketing opt-in checkbox (`#field-optin`) is accepted where present. Omitting the Customer Data Privacy checkbox causes the form to silently refuse to advance — this was the root cause of TC-CO-004/TC-CO-005 failures prior to the fix.

### Checkout Navigation

The "Proceed to checkout" button uses `frame.goto(href)` with `waitUntil: 'domcontentloaded'` to bypass Hummingbird's client-side click interception. Direct `.click()` on the anchor works in Chromium but can hang in Firefox and WebKit.

### Demo Site Flakiness

The shared PrestaShop demo is a public site subject to network variability. Any test may occasionally time out on first attempt and pass on retry. `retries: 1` in `playwright.config.ts` handles this automatically. No test requires more than one retry under normal conditions.

### Duplicate `#field-email`

Hummingbird's checkout page renders both a Guest form and a Sign-in tab simultaneously, each containing a `#field-email` input. All selectors target `.first()` to reach the guest form field.
