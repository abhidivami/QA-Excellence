# Week 3 — E2E Automation Testing with Playwright

This week covers end-to-end automation testing — using Playwright and TypeScript to automate a real browser, following the Page Object Model pattern, and running tests automatically on every code push via GitHub Actions.

---

## What We Did

We started with the study guide covering E2E concepts and Playwright fundamentals, then built a complete automation suite for [SauceDemo](https://www.saucedemo.com) — a practice e-commerce app. The suite covers login, inventory, add to cart, checkout form validation, and order confirmation. All 18 tests pass and run in under 15 seconds.

---

## Folder Structure

```
Week-3/
├── 01_Study_Guide_Automation_Testing.md
├── 03_Automation_Testing.pptx
└── tests/
    ├── fixtures/
    │   └── testData.ts          ← Centralized test data (users, products, expected values)
    ├── pages/                   ← Page Object classes (one per page)
    │   ├── LoginPage.ts
    │   ├── InventoryPage.ts
    │   ├── CartPage.ts
    │   ├── CheckoutPage.ts
    │   └── CheckoutCompletePage.ts
    ├── tests/                   ← Test spec files
    │   ├── login.spec.ts
    │   └── checkout.spec.ts
    ├── playwright-report/       ← HTML report generated after each run
    ├── playwright.config.ts     ← Playwright configuration
    ├── package.json
    ├── tsconfig.json
    └── run_tests.sh             ← Shell script to run tests and save log

.github/
└── workflows/
    └── playwright.yml           ← GitHub Actions CI pipeline
```

---

## Files Explained

### Study Material

| File | What it is |
| --- | --- |
| `01_Study_Guide_Automation_Testing.md` | Theory notes — E2E vs API vs unit, Playwright vs Selenium/Cypress, TypeScript basics, POM, fixtures, CI/CD |
| `03_Automation_Testing.pptx` | Trainer slides |

---

### Fixtures

#### `tests/fixtures/testData.ts`
All test data in one place — no hardcoded values inside test files.

| Export | What it contains |
| --- | --- |
| `users` | `standard_user`, `locked_out_user`, `problem_user` — all with `secret_sauce` password |
| `products` | Product names: Backpack, Bike Light, Bolt T-Shirt |
| `checkout` | Shipping form values: First Name, Last Name, Postal Code |
| `expected` | Page titles, confirmation messages, error text |

---

### Page Objects

Each class represents one page of the app. Tests call methods on these classes instead of writing locators directly in test files.

| File | What it covers |
| --- | --- |
| `LoginPage.ts` | `goto()`, `login()`, `getErrorMessage()`, `getPageTitle()` |
| `InventoryPage.ts` | `getTitle()`, `getProductCount()`, `addToCart()`, `getCartBadgeCount()`, `goToCart()` |
| `CartPage.ts` | `getTitle()`, `getCartItems()`, `getCartItemNames()`, `proceedToCheckout()` |
| `CheckoutPage.ts` | `fillShippingInfo()`, `continue()`, `getErrorMessage()`, `finish()` |
| `CheckoutCompletePage.ts` | `getConfirmationHeader()`, `getConfirmationText()` |

---

### Test Specs

#### `tests/tests/login.spec.ts` — 6 tests

| TC | Scenario |
| --- | --- |
| TC-L-001 | Page title is "Swag Labs" |
| TC-L-002 | Standard user logs in and lands on inventory |
| TC-L-003 | Locked out user sees error message |
| TC-L-004 | Empty username shows validation error |
| TC-L-005 | Empty password shows validation error |
| TC-L-006 | Wrong credentials show error |

#### `tests/tests/checkout.spec.ts` — 12 tests

| TC | Scenario |
| --- | --- |
| TC-C-001 | Inventory page title is "Products" |
| TC-C-002 | Inventory page shows 6 products |
| TC-C-003 | Sort dropdown is present |
| TC-C-004 | Adding one item shows badge count of 1 |
| TC-C-005 | Adding two items shows badge count of 2 |
| TC-C-006 | Cart page shows the added product name |
| TC-C-007 | Cart page title is "Your Cart" |
| TC-C-008 | Checkout information page has correct title |
| TC-C-009 | Checkout overview shown after filling form |
| TC-C-010 | Missing first name on checkout shows error |
| TC-C-011 | Completed order shows confirmation header |
| TC-C-012 | Completed order shows dispatch message |

**18 tests | 18 passed | runs in ~14 seconds**

---

### Configuration

#### `playwright.config.ts`
- Target: `https://www.saucedemo.com`
- Browser: Chromium (Desktop Chrome)
- Timeout: 30 seconds per test
- Retries: 1 (on failure)
- Reporter: HTML report + list output in terminal
- Screenshots: on failure only
- Video: retained on failure
- Trace: on first retry

---

### CI/CD Pipeline

#### `.github/workflows/playwright.yml`

Runs automatically on every push or pull request to `main`.

```
Developer pushes code
      ↓
GitHub Actions triggers
      ↓
Installs Node 20, Playwright, Chromium
      ↓
Runs all 18 tests
      ↓
Reports ✅ or ❌ on the PR/push page
      ↓
HTML report uploaded as artifact (kept 30 days)
```

To download the report: go to the GitHub Actions run → click **playwright-report** artifact → download and open `index.html`.

---

## How to Run

### Prerequisites
- Node.js installed (`node --version` to check)

### Setup
```bash
cd Week-3/tests
npm install
npx playwright install chromium
```

### Run all tests
```bash
npm test
```

### Run only login tests
```bash
npm run test:login
```

### Run only checkout tests
```bash
npm run test:checkout
```

### View HTML report
```bash
npm run report
```

### Run with shell script (saves log file)
```bash
./run_tests.sh
```

---

## Test Results

The HTML report is generated in `playwright-report/` after every run. In CI, it is uploaded as a GitHub Actions artifact and can be downloaded from the Actions run page.

The report shows:
- Total passed / failed / skipped
- Duration per test
- Screenshot at the point of failure (if any)
- Video of the test run (retained on failure)
- Full trace on retry — every action the test took, step by step

---

## SauceDemo Users Available

| Username | Behaviour |
| --- | --- |
| `standard_user` | Happy path — everything works |
| `locked_out_user` | Cannot log in — sees error immediately |
| `problem_user` | Logged in but images are broken, some features fail |
| `performance_glitch_user` | Login is slow (5+ seconds) |
| `error_user` | Random errors during checkout |
| `visual_user` | UI visual bugs |

All passwords: `secret_sauce`
