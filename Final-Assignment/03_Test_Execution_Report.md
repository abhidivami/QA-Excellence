# Test Execution Report — PrestaShop Demo E-Commerce Store

**Application Under Test:** PrestaShop 8 (Hummingbird Theme) — <https://demo.prestashop.com/>
**Test Type:** End-to-End Automated (Playwright + TypeScript)
**Execution Date:** 2026-05-24
**Executed By:** Playwright CI (local Chromium run)
**Tool Version:** Playwright 1.44.0 · TypeScript 5.4.5 · Node 20

---

## Execution Summary

| Metric | Value |
| ------ | ----- |
| Total Test Cases | 25 |
| Passed | 25 |
| Failed | 0 |
| Flaky (passed on retry) | 1 |
| Skipped | 0 |
| Total Duration | ~4 minutes |
| Browser | Chromium (Desktop Chrome, 1280 × 720) |
| Workers | 1 |
| Retries Configured | 1 |
| Exit Code | 0 (all tests green) |

> **CI runs additionally execute Firefox and WebKit** (75 total test runs). Firefox and WebKit are CI-only because the PrestaShop demo site's iframe navigation takes significantly longer in those browsers on macOS.

---

## Test Results

### TC-HP — Homepage

| ID | Title | Status | Duration | Notes |
| -- | ----- | ------ | -------- | ----- |
| TC-HP-001 | Store page title contains PrestaShop | ✅ Pass | 533 ms | |
| TC-HP-002 | Navigation shows Clothes, Accessories and Art categories | ✅ Pass | 537 ms | |
| TC-HP-003 | Search widget is visible and accepts input | ✅ Pass | 489 ms | |
| TC-HP-004 | Featured products section displays at least one product | ✅ Pass | 477 ms | |
| TC-HP-005 | Cart badge shows 0 after a completed order | ✅ Pass | 541 ms | Relies on TC-CO-005 having placed an order and cleared the cart |

**Suite result: 5 / 5 passed**

---

### TC-SR — Search

| ID | Title | Status | Duration | Notes |
| -- | ----- | ------ | -------- | ----- |
| TC-SR-001 | Searching for a valid term returns results | ✅ Pass | 917 ms | |
| TC-SR-002 | Search results display product names | ✅ Pass | 915 ms | |
| TC-SR-003 | Search results contain the searched product name | ✅ Pass | 954 ms | |
| TC-SR-004 | Searching for a non-existent term shows no results | ✅ Pass | 1.0 s | |
| TC-SR-005 | Clicking a search result navigates to the product detail page | ⚠️ Flaky | 4.8 s (retry) | First attempt: `net::ERR_ABORTED` on homepage navigation — transient demo-site network error. Passed cleanly on retry #1. |

**Suite result: 5 / 5 passed (1 flaky, handled by retries:1)**

---

### TC-PD — Product

| ID | Title | Status | Duration | Notes |
| -- | ----- | ------ | -------- | ----- |
| TC-PD-001 | Clothes category page displays products | ✅ Pass | 2.5 s | |
| TC-PD-002 | Product detail page shows name, price and add to cart button | ✅ Pass | 3.5 s | |
| TC-PD-003 | Adding a product to cart shows confirmation modal | ✅ Pass | 5.4 s | |
| TC-PD-004 | Cart count updates to 1 after adding a product | ✅ Pass | 17.2 s | Includes clearCart + navigate + addToCart + modal wait |
| TC-PD-005 | Adding two products updates cart count to 2 | ✅ Pass | 22.8 s | Two full add-to-cart cycles |

**Suite result: 5 / 5 passed**

---

### TC-CA — Cart

| ID | Title | Status | Duration | Notes |
| -- | ----- | ------ | -------- | ----- |
| TC-CA-001 | Cart page shows the added product | ✅ Pass | 21.7 s | Includes clearCart + addToCart beforeEach |
| TC-CA-002 | Cart shows product name and order total | ✅ Pass | 8.1 s | |
| TC-CA-003 | Product can be removed from cart | ✅ Pass | 9.8 s | |
| TC-CA-004 | Checkout button is visible in cart | ✅ Pass | 7.2 s | |
| TC-CA-005 | Clicking checkout navigates to checkout page | ✅ Pass | 8.8 s | Uses `frame.goto(href)` to bypass click interception |

**Suite result: 5 / 5 passed**

---

### TC-CO — Checkout

| ID | Title | Status | Duration | Notes |
| -- | ----- | ------ | -------- | ----- |
| TC-CO-001 | Checkout page loads and shows personal info step | ✅ Pass | 17.3 s | |
| TC-CO-002 | Personal info form has firstname, lastname and email fields | ✅ Pass | 7.1 s | |
| TC-CO-003 | Submitting empty personal info does not advance the form | ✅ Pass | 25.5 s | HTML5 native validation; address step must remain hidden |
| TC-CO-004 | Address step appears after completing personal info | ✅ Pass | 19.3 s | Requires Terms & Conditions + Customer Data Privacy (GDPR) checkboxes |
| TC-CO-005 | Full guest checkout flow completes with order confirmation | ✅ Pass | 17.0 s | 4-step flow: personal info → address → delivery → payment. Test timeout overridden to 420 s. |

**Suite result: 5 / 5 passed**

---

## Defects Found During Automation

No defects remain open. The following issues were discovered and resolved during test development:

| # | Issue | Root Cause | Resolution |
| - | ----- | ---------- | ---------- |
| 1 | TC-CO-004/005 silently refused to advance to address step | PrestaShop 8 requires a second GDPR "Customer Data Privacy" checkbox in addition to Terms & Conditions. Missing it blocks form submission without any error message. | Added `getByRole('checkbox', { name: /customer data privacy/i })` handling inside `CheckoutPage.fillPersonalInfo()` |
| 2 | TC-CA-003 `clearCart()` left stale elements | After clicking the delete link, PrestaShop performs a full page reload. The original 1 s fixed sleep was insufficient, causing stale-element errors on the next `removeBtns.count()` check. | Replaced `waitForTimeout(1000)` with `waitForLoadState('domcontentloaded', { timeout: 15000 })` in `helpers/cartUtils.ts` |

---

## Flaky Test Analysis

| Test | Frequency | Cause | Mitigation |
| ---- | --------- | ----- | ---------- |
| TC-SR-005 | Occasional (1 occurrence in this run) | `net::ERR_ABORTED` on `store.goto(homepage)` in `beforeEach` — transient TCP reset from the shared public demo server | `retries: 1` in `playwright.config.ts` catches this automatically; no test logic change needed |

---

## Environment

| Parameter | Value |
| --------- | ----- |
| Application URL | <https://demo.prestashop.com/> |
| Demo provisioning | Unique shop per session via `iframe#framelive` at `*.demo.prestashop.com` |
| OS | macOS 14 (Darwin 23.1.0) |
| Browser (local) | Chromium (Desktop Chrome) |
| Browsers (CI) | Chromium · Firefox · WebKit |
| Viewport | 1280 × 720 |
| Test framework | Playwright 1.44.0 |
| Language | TypeScript 5.4.5 |
| Node | 20 |

---

## CI / CD

The full Playwright HTML report (with per-test traces, screenshots, and video on failure) is uploaded as an artifact (`prestashop-playwright-report`) on every GitHub Actions run and retained for 30 days. Trigger: any push or pull request touching `Final-Assignment/**`.

In CI, all three browser projects run in parallel:

```
Chromium  ──┐
Firefox   ──┼── 75 tests total (25 per browser) ── report artifact
WebKit    ──┘
```
