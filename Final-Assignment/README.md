# Final Assignment — QA Excellence

E2E Playwright automation for the [PrestaShop 8 Hummingbird demo store](https://demo.prestashop.com/).

## Deliverables

| Artifact | Path |
| -------- | ---- |
| Test Cases | `01_Test_Cases.md` |
| Test Data | `02_Test_Data.md` |
| Automation suite | `tests/` |

## Test Coverage

25 test cases × 3 browsers = **75 test runs** on every CI push (25 locally with Chromium).

| Suite | IDs | Tests |
| ----- | --- | ----- |
| Homepage | TC-HP-001 – TC-HP-005 | 5 |
| Search | TC-SR-001 – TC-SR-005 | 5 |
| Product | TC-PD-001 – TC-PD-005 | 5 |
| Cart | TC-CA-001 – TC-CA-005 | 5 |
| Checkout | TC-CO-001 – TC-CO-005 | 5 |

## Quick Start

```bash
cd tests
npm install
npx playwright install          # installs Chromium, Firefox, WebKit
npm test                        # runs 25 Chromium tests locally
```

Run all three browsers (CI mode — requires faster network than macOS demo-site):

```bash
CI=true npm test                # runs 75 tests (Chromium + Firefox + WebKit)
```

Run a specific suite:

```bash
npm run test:checkout
```

Open the HTML report after a run:

```bash
npm run report
```

> **Browser strategy:** Firefox and WebKit run in CI (`ubuntu-latest`) where the demo
> site loads quickly. On macOS, Firefox's beforeEach chain (5–6 iframe navigations)
> exceeds the 240 s test timeout; WebKit's ARM64 binary crashes with Bus Error on
> Apple Silicon. Both work correctly in the GitHub Actions environment.

## Architecture

```text
tests/
├── fixtures/
│   ├── storeFixtures.ts   # worker-scoped demo shop provisioning (browser-agnostic)
│   └── testData.ts        # centralised test data constants
├── helpers/
│   └── cartUtils.ts       # shared clearCart() used by Cart and Product suites
├── pages/                 # Page Object Model — one class per page
│   ├── HomePage.ts
│   ├── SearchPage.ts
│   ├── ProductPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
└── tests/                 # spec files (run alphabetically per worker)
    ├── cart.spec.ts
    ├── checkout.spec.ts
    ├── homepage.spec.ts
    ├── product.spec.ts
    └── search.spec.ts
```

## Key Implementation Notes

**Multi-browser isolation** — Each browser project gets its own worker with its own
worker-scoped fixture, which provisions a unique demo shop session inside the
`iframe#framelive` at `*.demo.prestashop.com`. Cart state never bleeds across browsers.

**`waitUntil: 'domcontentloaded'`** — Every `frame.goto()` call uses this option.
The demo site's full `load` event hangs indefinitely due to third-party analytics;
`domcontentloaded` fires as soon as the HTML is parsed and is reliable across all three
browsers.

**Cart isolation** — Cart state is server-side and persists within a browser session.
`clearCart()` (from `helpers/cartUtils.ts`) is called in `beforeEach` in the Cart and
Product suites to guarantee a clean slate before each test.

**AJAX step transitions** — Hummingbird checkout transitions between steps via AJAX.
Each `continueXxx()` method waits explicitly for the next step's element to become
visible (8–10 s ceiling) instead of a fixed sleep, which is both faster and safer
across the varied rendering speeds of different browsers.

**GDPR checkboxes** — PrestaShop 8 requires two consent checkboxes on the personal
information step before the form submits: Terms & Conditions and Customer Data Privacy.
Both are handled in `CheckoutPage.fillPersonalInfo()`. Omitting the Customer Data
Privacy checkbox silently blocks form submission — a subtle bug discovered during
cross-browser debugging.

**Checkout navigation** — `CartPage.proceedToCheckout()` navigates by `frame.goto(href)`
rather than `.click()` to bypass Hummingbird's client-side interception, which is
inconsistent across browsers.

## Playwright Config

| Setting | Local | CI (`CI=true`) |
| ------- | ----- | -------------- |
| Browsers | Chromium | Chromium · Firefox · WebKit |
| Workers | 1 | 3 (one per browser) |
| Viewport | 1280 × 720 | 1280 × 720 |
| Test timeout | 240 s | 240 s (TC-CO-005: 420 s) |
| Retries | 1 | 1 |
| Reporter | `list` + `html` | `list` + `html` |
| Screenshots | On failure only | On failure only |
| Video | Retained on failure | Retained on failure |
| Trace | On first retry | On first retry |

## CI / CD

GitHub Actions runs on every push or PR that touches `Final-Assignment/**`.
All three browsers are installed and run in a single job (parallel workers).
The HTML report is uploaded as an artifact (`prestashop-playwright-report`) and
kept for 30 days.
