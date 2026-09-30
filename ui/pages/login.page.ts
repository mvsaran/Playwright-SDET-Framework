import { expect, Locator, Page } from '@playwright/test';
import { ROUTES } from './ui.types';
import { logger } from '../../utils/logger';

/**
 * LoginPage — Page Object for the login screen.
 *
 * Responsibilities:
 *  - Owns all locators for the login page
 *  - Provides high-level actions (login, enterUsername, etc.)
 *  - Provides assertions (verifyLoginSuccess, verifyLoginError)
 *
 * Rules enforced here:
 *  - No test data generation (use UserFactory)
 *  - No API calls (use AuthClient)
 *  - No direct locator exposure to tests
 *  - No hard waits — rely on Playwright auto-waiting
 *
 * ADAPT: Locator strategies may need to change for your application.
 * Prefer in order: getByRole > getByLabel > getByTestId > getByText
 */
export class LoginPage {
  private readonly page: Page;
  private readonly pageLogger = logger.child('LoginPage');

  // ── Locators ──────────────────────────────────────────────────────────────
  // Locators are private — tests must not access raw locators
  // ADAPT: Update these to match your application's actual elements

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly loginForm: Locator;

  constructor(page: Page) {
    this.page = page;

    // ADAPT: Update these to match your application's actual elements
    // Below selectors are calibrated for Sauce Demo (saucedemo.com)
    // Sauce Demo uses placeholder text and ID attributes
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.locator('[data-test="error"]');
    this.loginForm = page.locator('.login-box');
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  /**
   * Navigate to the login page.
   */
  async navigate(): Promise<void> {
    this.pageLogger.info('Navigating to login page');
    await this.page.goto(ROUTES.login);
    await this.verifyPageLoaded();
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Complete the full login flow in one call.
   * Use this in tests that aren't testing the login form itself.
   */
  async login(username: string, password: string): Promise<void> {
    this.pageLogger.info('Logging in via UI', { username });
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }

  async enterUsername(username: string): Promise<void> {
    await this.usernameInput.fill(username);
  }

  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  async clearUsername(): Promise<void> {
    await this.usernameInput.clear();
  }

  async clearPassword(): Promise<void> {
    await this.passwordInput.clear();
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  /**
   * Assert that login succeeded by checking the URL has changed
   * away from the login page to the home/inventory page.
   */
  async verifyLoginSuccess(): Promise<void> {
    this.pageLogger.info('Verifying login success');
    await expect(this.page).toHaveURL(new RegExp(ROUTES.home));
    this.pageLogger.info('Login success verified');
  }

  /**
   * Assert that an error message is visible and optionally matches text.
   *
   * @param expectedMessage - Optional substring to match in the error message
   */
  async verifyLoginError(expectedMessage?: string | RegExp): Promise<void> {
    this.pageLogger.info('Verifying login error is shown');
    await expect(this.errorMessage).toBeVisible();
    if (expectedMessage) {
      await expect(this.errorMessage).toContainText(expectedMessage);
    }
  }

  /**
   * Assert the login page has loaded and the form is visible.
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.loginForm).toBeVisible();
    await expect(this.usernameInput).toBeVisible();
    await expect(this.loginButton).toBeEnabled();
  }
}
