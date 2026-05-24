import { test as base } from '@playwright/test';
import type { Frame } from '@playwright/test';

type WorkerFixtures = {
    store: Frame;
    storeOrigin: string;
};

export const test = base.extend<{}, WorkerFixtures>({
    store: [async ({ browser }, use) => {
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();

        await page.goto('https://demo.prestashop.com/', { timeout: 60000 });

        // Wait for the SPA to provision the demo shop — iframe gets a real src
        await page.waitForSelector('iframe#framelive[src*=".demo.prestashop.com"]', {
            timeout: 90000,
        });

        // Buffer for store to initialise inside the iframe
        await page.waitForTimeout(6000);

        // Find the store frame by URL — exclude analytics iframes
        let storeFrame = page.frames().find(
            f => f.url().includes('.demo.prestashop.com') && !f.url().includes('doubleclick')
        );

        // Retry once if frame not found yet
        if (!storeFrame) {
            await page.waitForTimeout(5000);
            storeFrame = page.frames().find(
                f => f.url().includes('.demo.prestashop.com') && !f.url().includes('doubleclick')
            );
        }

        if (!storeFrame) throw new Error('Store frame not found — demo provisioning may have failed');

        await storeFrame.waitForLoadState('domcontentloaded', { timeout: 30000 });
        // Wait until the top nav is visible — confirms the store is interactive
        await storeFrame.waitForSelector('#top-menu', { timeout: 30000 });

        await use(storeFrame);
        await context.close();
    }, { scope: 'worker' }],

    storeOrigin: [async ({ store }, use) => {
        // Extract origin from the provisioned store URL e.g. https://happy-sneeze.demo.prestashop.com
        const origin = store.url().match(/https?:\/\/[^/]+/)?.[0] ?? '';
        await use(origin);
    }, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
