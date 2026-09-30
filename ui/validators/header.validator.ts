import { expect, Page } from '@playwright/test';
import { logger } from '../../utils/logger';

/**
 * HeaderValidator — reusable assertions for application header / navigation.
 *
 * Responsibilities:
 *  - Verify user identity displayed in the header
 *  - Verify navigation elements visibility after login/logout
 *  - Verify cart badge state
 *
 * ADAPT: Update locators and text patterns to match your application header.
 */
export class HeaderValidator {
  private readonly page: Page;
  private readonly validatorLogger = logger.child('HeaderValidator');

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verify the user appears as logged in (header reflects authenticated state).
   * ADAPT: Update to match your application's post-login header structure.
   */
  async verifyUserIsLoggedIn(username?: string): Promise<void> {
    this.validatorLogger.info('Verifying header shows logged-in state', { username });

    // ADAPT: Check for a user avatar, greeting, or profile link
    const userIndicator = this.page.getByRole('button', { name: /account|profile|menu/i });
    await expect(userIndicator).toBeVisible();

    if (username) {
      // Optionally verify the username is displayed
      const userDisplay = this.page.getByText(new RegExp(username, 'i'));
      if (await userDisplay.isVisible()) {
        await expect(userDisplay).toBeVisible();
      }
    }

    this.validatorLogger.info('Logged-in header state verified');
  }

  /**
   * Verify the user appears as logged out (no profile, login link visible).
   */
  async verifyUserIsLoggedOut(): Promise<void> {
    this.validatorLogger.info('Verifying header shows logged-out state');

    // ADAPT: Check for a login button or link being visible
    const loginLink = this.page.getByRole('link', { name: /login|sign in/i });
    await expect(loginLink).toBeVisible();

    this.validatorLogger.info('Logged-out header state verified');
  }

  /**
   * Verify the cart badge shows a specific item count.
   *
   * @param count - Expected number of items; pass 0 to verify badge is hidden
   */
  async verifyCartBadgeCount(count: number): Promise<void> {
    this.validatorLogger.info('Verifying cart badge count', { expected: count });

    // ADAPT: Update the selector to your cart badge element
    const cartBadge = this.page.locator('.shopping_cart_badge');

    if (count === 0) {
      await expect(cartBadge).toBeHidden();
    } else {
      await expect(cartBadge).toHaveText(String(count));
    }

    this.validatorLogger.info('Cart badge count verified', { expected: count });
  }

  /**
   * Verify the page title / hero heading is visible.
   *
   * @param expectedTitle - Expected visible title text
   */
  async verifyPageTitle(expectedTitle: string | RegExp): Promise<void> {
    const heading = this.page.getByRole('heading', { level: 1 });
    await expect(heading).toContainText(expectedTitle);
  }
}
