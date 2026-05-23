import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users, expected } from '../fixtures/testData';

test.describe('Login', () => {

    test('TC-L-001: page title is correct', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        const title = await loginPage.getPageTitle();
        expect(title).toBe(expected.pageTitle);
    });

    test('TC-L-002: standard user can log in successfully', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.standard.username, users.standard.password);
        await expect(page).toHaveURL(/inventory/);
    });

    test('TC-L-003: locked out user sees error message', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.lockedOut.username, users.lockedOut.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain(expected.lockedOutError);
    });

    test('TC-L-004: empty username shows validation error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('', users.standard.password);
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Username is required');
    });

    test('TC-L-005: empty password shows validation error', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login(users.standard.username, '');
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Password is required');
    });

    test('TC-L-006: wrong credentials show error message', async ({ page }) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('wrong_user', 'wrong_pass');
        const error = await loginPage.getErrorMessage();
        expect(error).toContain('Username and password do not match');
    });

});
