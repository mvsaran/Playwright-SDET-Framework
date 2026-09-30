import { test } from '../fixtures/browser.fixture';
import { config } from '../utils/config';

/**
 * Login Flow Tests
 *
 * What is under test:
 *  - The login page UI functionality itself
 *  - Valid credentials produce successful login
 *  - Invalid credentials surface an error message
 *  - Locked account scenario (if supported by the application)
 *
 * Architecture:
 *  - freshUser  → data only, no API call (registration not required here)
 *  - loginPage  → page object owns all locators and actions
 *  - Tests describe BUSINESS BEHAVIOR, not implementation
 *
 * NOTE: For tests that are NOT testing login itself, prefer API authentication
 * via the AuthClient and storageState rather than repeating UI login.
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.navigate();
  });

  // ── Happy path ────────────────────────────────────────────────────────────

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside loginPage.verifyLoginSuccess()
  test('valid credentials allow the user to log in', async ({ loginPage }) => {
    // Use environment-configured credentials (default test account)
    // ADAPT: Replace with a registered test user from UserFactory if your app requires registration
    await loginPage.login(config.username, config.password);
    await loginPage.verifyLoginSuccess();
  });

  // ── Negative scenarios ────────────────────────────────────────────────────

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside loginPage.verifyLoginError()
  test('wrong password shows an error message', async ({ loginPage, freshUser }) => {
    // freshUser provides a realistic-looking email address
    // We deliberately use a wrong password to trigger the error
    await loginPage.login(freshUser.email, 'definitely-wrong-password');
    await loginPage.verifyLoginError();
  });

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside loginPage.verifyLoginError()
  test('empty username shows a validation error', async ({ loginPage }) => {
    // Leave username blank
    await loginPage.enterPassword('any-password');
    await loginPage.clickLogin();
    await loginPage.verifyLoginError();
  });

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside loginPage.verifyLoginError()
  test('empty password shows a validation error', async ({ loginPage }) => {
    await loginPage.enterUsername('some.user@example.com');
    await loginPage.clickLogin();
    await loginPage.verifyLoginError();
  });

  // ── Locked/disabled account ───────────────────────────────────────────────
  // ADAPT: Enable this test if your application supports locked user accounts.
  // Many demo apps (e.g. Sauce Demo) have a known locked_out_user for this.
  // eslint-disable-next-line playwright/no-skipped-test, playwright/expect-expect -- intentional template; enable when locked accounts are available
  test.skip('locked account shows a specific locked-out error', async ({ loginPage }) => {
    // ADAPT: Use a known locked account credential from your test environment
    await loginPage.login('locked_out_user@example.com', 'secret_sauce');
    await loginPage.verifyLoginError(/locked out/);
  });
});
