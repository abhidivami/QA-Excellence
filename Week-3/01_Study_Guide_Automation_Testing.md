# Study Guide — Automation Testing with Playwright

**Week:** 3  
**Date:** 2026-05-23  
**Topics:** E2E Automation, Playwright, TypeScript, Page Object Model, Fixtures, CI/CD

---

## Part 1: What is E2E Automation and Where It Fits

### The Testing Pyramid Reminder

```
        /\
       /  \
      / E2E \          ← Fewest tests, slowest, most realistic
     /--------\
    / API Tests \      ← More tests, faster
   /------------\
  /  Unit Tests  \     ← Most tests, fastest, most isolated
 /________________\
```

E2E (End-to-End) sits at the top. It opens a real browser, clicks through the UI like a real user, and checks the final outcome. It is the closest thing to how a user actually experiences the product.

### The Analogy

Unit tests are like testing a car's brakes in a workshop — isolated, controlled.  
API tests are like checking if the engine communicates correctly with the gearbox.  
E2E tests are like taking the whole car on a test drive — does it actually get you from A to B?

### Why Automate E2E?

Manual E2E testing of the same flow every sprint is:
- Slow — a single checkout flow can take 10 minutes manually
- Inconsistent — humans skip steps, miss edge cases
- Not scalable — 50 flows × every PR = impossible

Automated E2E does the same in seconds, every time, on every commit.

---

## Part 2: Why Playwright

Three major E2E tools exist: Selenium, Cypress, Playwright.

| | Selenium | Cypress | Playwright |
| --- | --- | --- | --- |
| Language | Java, Python, JS | JavaScript only | JS, TS, Python, Java |
| Speed | Slow | Fast | Very fast |
| Multi-browser | Yes (complex) | Chrome-only (mostly) | Chrome, Firefox, Safari |
| Auto-wait | No — manual waits | Yes | Yes |
| TypeScript support | Limited | Yes | First-class |
| Screenshots on failure | Manual setup | Built-in | Built-in |
| CI/CD ready | Yes | Yes | Yes |
| Maintained by | Community | Cypress Inc | Microsoft |

**Playwright is the modern standard.** Microsoft actively maintains it. It handles waiting for elements automatically so you don't write `sleep()` everywhere. It supports TypeScript natively. It generates HTML reports with screenshots and traces by default.

---

## Part 3: TypeScript Basics for Testing

You don't need to know all of TypeScript. You need to know four things.

### 1. Types

```typescript
const username: string = 'standard_user';
const itemCount: number = 3;
const isLoggedIn: boolean = true;
```

TypeScript adds a type after the colon. If you pass the wrong type, the editor flags it before you even run the code.

### 2. Classes

A class is a blueprint. In Page Object Model, each page of the app becomes one class.

```typescript
class LoginPage {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async login(username: string, password: string) {
        await this.page.getByLabel('Username').fill(username);
        await this.page.getByLabel('Password').fill(password);
        await this.page.getByRole('button', { name: 'Login' }).click();
    }
}
```

### 3. async / await

All Playwright actions are asynchronous — they talk to a real browser which takes time. `async` marks a function as asynchronous. `await` says "wait for this to finish before moving on."

```typescript
// Without await — browser hasn't finished clicking yet, next line runs too early
page.click('button');
page.getByText('Success'); // ❌ might not be there yet

// With await — waits for click to complete first
await page.click('button');
await page.getByText('Success'); // ✅ safe
```

### 4. import / export

Classes and data live in separate files and are shared using import/export.

```typescript
// LoginPage.ts
export class LoginPage { ... }

// login.spec.ts
import { LoginPage } from '../pages/LoginPage';
```

---

## Part 4: Playwright Core Concepts

### Browser, Context, Page

```
Browser
  └── BrowserContext  (like a fresh incognito window — isolated session)
        └── Page      (one tab — this is what you interact with)
```

In tests you almost always work with `page`. Playwright creates and manages the browser and context for you.

### Locators — How Playwright Finds Elements

Playwright has a priority order for locators. Always use the highest one that works.

| Priority | Locator | Example | Why |
| --- | --- | --- | --- |
| 1st | `getByRole` | `page.getByRole('button', { name: 'Login' })` | Accessibility-based, most resilient |
| 2nd | `getByLabel` | `page.getByLabel('Username')` | Best for form fields |
| 3rd | `getByText` | `page.getByText('Welcome')` | Good for visible content |
| 4th | `getByTestId` | `page.getByTestId('cart-icon')` | Requires `data-testid` attribute in HTML |
| 5th | `locator (CSS)` | `page.locator('.btn-primary')` | Use when above options don't work |
| Last | `locator (XPath)` | `page.locator("//input[@id='user-name']")` | Fragile — avoid unless no other option |

**Why does order matter?**  
`getByRole('button', { name: 'Login' })` works even if the CSS class changes. A CSS selector `.btn-login` breaks the moment a developer renames the class. Role-based locators survive UI changes.

### Assertions

```typescript
// Check text is visible
await expect(page.getByText('Products')).toBeVisible();

// Check URL
await expect(page).toHaveURL('https://saucedemo.com/inventory.html');

// Check element count
await expect(page.locator('.inventory_item')).toHaveCount(6);

// Check input value
await expect(page.getByLabel('First Name')).toHaveValue('John');
```

Playwright's `expect` automatically waits and retries for a few seconds before failing. No manual waits needed.

### Auto-Wait — The Most Important Feature

In Selenium you had to write:
```java
Thread.sleep(3000); // wait 3 seconds hoping the button appears
```

Playwright waits automatically. When you write:
```typescript
await page.getByRole('button', { name: 'Add to cart' }).click();
```

Playwright waits until:
- The button is in the DOM
- The button is visible
- The button is not disabled
- The button is not covered by another element

Then it clicks. If none of these happen within the timeout (default 30s), it fails with a clear error.

---

## Part 5: Page Object Model (POM)

### The Problem POM Solves

Imagine you have 20 tests and all of them log in. You write `page.fill('#user-name', ...)` in all 20 tests. The developer renames the input field. You fix it in 20 places.

With POM you fix it in **one place** — the LoginPage class.

### The Structure

```
tests/
├── pages/              ← Page Object classes (one per page)
│   ├── LoginPage.ts
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── tests/              ← Actual test files
│   └── checkout.spec.ts
└── fixtures/           ← Test data (credentials, product names)
    └── testData.ts
```

### How It Works

**LoginPage.ts** — knows where the username field is, knows how to log in
```typescript
export class LoginPage {
    constructor(private page: Page) {}

    async goto() {
        await this.page.goto('https://www.saucedemo.com');
    }

    async login(username: string, password: string) {
        await this.page.getByPlaceholder('Username').fill(username);
        await this.page.getByPlaceholder('Password').fill(password);
        await this.page.getByRole('button', { name: 'Login' }).click();
    }

    async getErrorMessage() {
        return this.page.locator('[data-test="error"]').textContent();
    }
}
```

**checkout.spec.ts** — knows nothing about locators, just calls page methods
```typescript
test('user can log in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
});
```

The test reads like plain English. If the username field locator changes, you fix `LoginPage.ts` once — all tests that use it are automatically fixed.

### The Rule

> Tests describe **what** to do. Page Objects describe **how** to do it.

---

## Part 6: Fixtures — Test Data Management

### What Is a Fixture?

A fixture is a predefined set of data that a test uses. Instead of hardcoding values inside tests, you put them in one place and import them.

### Why?

```typescript
// ❌ Bad — hardcoded, scattered, hard to maintain
await page.fill('#user-name', 'standard_user');
await page.fill('#password', 'secret_sauce');
```

```typescript
// ✅ Good — centralized, easy to update, readable
import { users } from '../fixtures/testData';
await loginPage.login(users.standard.username, users.standard.password);
```

If the password changes, you update `testData.ts` once. All tests pick up the change automatically.

### Types of Fixtures

| Type | What it holds | Example |
| --- | --- | --- |
| User credentials | Usernames and passwords | `standard_user`, `locked_out_user` |
| Test data | Product names, quantities, addresses | `Sauce Labs Backpack`, `John`, `94102` |
| URLs | Base URL, specific page paths | `https://www.saucedemo.com` |
| Expected values | Text you assert against | `'Thank you for your order!'` |

---

## Part 7: CI/CD Pipeline with GitHub Actions

### What Is CI/CD?

CI = Continuous Integration. Every time code is pushed, a pipeline automatically runs — builds the code, runs the tests, reports results.

### Why Run Tests in CI?

Without CI: Developer pushes code → someone manually runs tests hours later → bug is in the codebase for hours.  
With CI: Developer pushes code → tests run in 2 minutes → bug flagged immediately before merge.

### GitHub Actions — How It Works

You create a file at `.github/workflows/playwright.yml`. GitHub reads it and runs the steps automatically on every push or pull request.

```yaml
name: Playwright Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install dependencies
        run: npm install

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run tests
        run: npx playwright test

      - name: Upload HTML report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

`if: always()` on the report upload means — even if tests fail, upload the report. This is important because you need the report most when tests fail.

### What Happens on a PR

```
Developer opens PR
      ↓
GitHub Actions triggers automatically
      ↓
Installs Node, Playwright, browsers
      ↓
Runs all tests
      ↓
Reports ✅ or ❌ directly on the PR page
      ↓
Reviewer sees results before merging
```

---

## Part 8: Playwright HTML Report

Playwright generates an HTML report automatically after every run. It shows:

- Total passed / failed / skipped
- Duration per test
- Screenshot at the point of failure
- Full trace — every action the test took, step by step
- Retry history — if a test was retried

To view it locally:
```bash
npx playwright show-report
```

This opens a browser with the full interactive report. In CI, it gets uploaded as an artifact and downloaded from the GitHub Actions run page.

---

## Summary — How Everything Connects

```
testData.ts (fixtures)
    ↓ provides credentials and data to
checkout.spec.ts (test file)
    ↓ calls methods from
LoginPage.ts, InventoryPage.ts, CartPage.ts, CheckoutPage.ts (page objects)
    ↓ which interact with
SauceDemo website (real browser via Playwright)
    ↓ results go into
HTML Report (local + CI artifact)
    ↓ triggered automatically by
GitHub Actions on every push / PR
```

---

## Key Takeaways

- E2E tests simulate a real user — they are the most realistic but also the most expensive to run and maintain
- Playwright is the modern standard — auto-wait, TypeScript, multi-browser, built-in reporting
- Page Object Model separates test logic from UI locators — change the locator once, fix everywhere
- Fixtures centralize test data — no hardcoded credentials or values inside test files
- CI/CD makes tests run automatically on every commit — bugs are caught before they reach main
- Use role-based locators first (`getByRole`, `getByLabel`) — they survive UI changes better than CSS selectors
