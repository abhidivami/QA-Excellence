import { test, expect } from '../fixtures/storeFixtures';
import { HomePage } from '../pages/HomePage';
import { SearchPage } from '../pages/SearchPage';
import { products, expected } from '../fixtures/testData';

test.describe('Search', () => {

    test.beforeEach(async ({ store, storeOrigin }) => {
        await store.goto(`${storeOrigin}/`, { waitUntil: 'domcontentloaded' });
    });

    test('TC-SR-001: searching for a valid term returns results', async ({ store }) => {
        const homePage = new HomePage(store);
        await homePage.searchFor(products.searchTerm);

        const searchPage = new SearchPage(store);
        const count = await searchPage.getResultCount();
        expect(count).toBeGreaterThan(0);
    });

    test('TC-SR-002: search results display product names', async ({ store }) => {
        const homePage = new HomePage(store);
        await homePage.searchFor(products.searchTerm);

        const searchPage = new SearchPage(store);
        const firstName = await searchPage.getFirstResultName();
        expect(firstName?.trim().length).toBeGreaterThan(0);
    });

    test('TC-SR-003: search results contain the searched product name', async ({ store }) => {
        const homePage = new HomePage(store);
        await homePage.searchFor(products.searchTerm);

        const searchPage = new SearchPage(store);
        const firstName = await searchPage.getFirstResultName();
        expect(firstName?.toLowerCase()).toContain(products.searchTerm.toLowerCase());
    });

    test('TC-SR-004: searching for non-existent term shows no results message', async ({ store }) => {
        const homePage = new HomePage(store);
        await homePage.searchFor(products.searchNoResults);

        const searchPage = new SearchPage(store);
        const noResults = await searchPage.hasNoResultsMessage();
        expect(noResults).toBe(true);
    });

    test('TC-SR-005: clicking a search result navigates to the product detail page', async ({ store }) => {
        const homePage = new HomePage(store);
        await homePage.searchFor(products.searchTerm);

        const searchPage = new SearchPage(store);
        await searchPage.clickFirstResult();

        await store.waitForLoadState('domcontentloaded');
        // Product detail pages have .html in their URL in this PrestaShop demo
        expect(store.url()).toContain('.html');
        const hasAddToCart = await store.locator('button[data-button-action="add-to-cart"]').first().isVisible();
        expect(hasAddToCart).toBe(true);
    });

});
