import { defineConfig, devices } from '@playwright/test';

// Firefox and WebKit are CI-only:
//   • Firefox:  each test's beforeEach chain makes 5-6 navigations of the demo
//               site; on macOS Firefox each navigation takes 30-60s, pushing
//               total beforeEach time past the 240s test timeout.  On
//               ubuntu-latest (CI) the same navigations complete in <10s.
//   • WebKit:   the ARM64 webkit binary crashes with Bus Error on Apple Silicon.
//               It runs correctly on ubuntu-latest (CI).
// Set CI=true locally to include Firefox and WebKit.
const isCI = !!process.env.CI;

export default defineConfig({
    testDir: './tests',
    timeout: 240000,
    retries: 1,
    // In CI: one worker per browser project (3 total).
    // Locally: one worker for Chromium only.
    workers: isCI ? 3 : 1,
    reporter: [
        ['html', { outputFolder: 'playwright-report', open: 'never' }],
        ['list'],
    ],
    use: {
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        // Firefox and WebKit are included only in CI (see comment at the top).
        ...(isCI ? [
            {
                name: 'firefox',
                use: { ...devices['Desktop Firefox'] },
            },
            {
                name: 'webkit',
                use: { ...devices['Desktop Safari'] },
            },
        ] : []),
    ],
});
