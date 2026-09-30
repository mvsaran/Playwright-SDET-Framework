import { test } from '../fixtures/browser.fixture';
import { OrderValidator } from '../ui/validators/order.validator';
import { config } from '../utils/config';

/**
 * Checkout Flow Tests — API + UI Hybrid
 *
 * This spec demonstrates the recommended hybrid testing pattern:
 *
 *  1. Create user via API (fast, reliable precondition setup)
 *  2. Log in via UI (using environment credentials for this demo)
 *  3. Perform UI actions (add product, checkout)
 *  4. Validate final state via UI validator
 *
 * Architecture:
 *  - testUser    → created via API, cleaned up after test
 *  - loginPage   → page object; no locators in the test
 *  - homePage    → page object; actions are business-intent methods
 *  - OrderValidator → encapsulates assertions, not duplicated here
 *
 * ADAPT:
 *  - Replace product names with real products from your application
 *  - Update checkout steps if your flow differs
 */

test.describe('Checkout Flow', () => {
  // ── Full checkout journey ────────────────────────────────────────────────

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside page object verify methods and OrderValidator
  test('authenticated user can add a product and complete checkout', async ({
    page,
    loginPage,
    homePage,
  }) => {
    const orderValidator = new OrderValidator(page);

    // ── Step 1: Navigate to login
    await loginPage.navigate();

    // ── Step 2: Log in with environment test account
    // ADAPT: If your app requires per-test users, use the `testUser` fixture
    await loginPage.login(config.username, config.password);
    await loginPage.verifyLoginSuccess();

    // ── Step 3: Verify home page loaded
    await homePage.verifyPageLoaded();

    // ── Step 4: Add a product to cart
    // ADAPT: Replace 'Sauce Labs Backpack' with a product in your application
    await homePage.addProductToCart('Sauce Labs Backpack');
    await homePage.verifyCartItemCount(1);

    // ── Step 5: Proceed to checkout
    await homePage.checkout();

    // ── Step 6: Fill checkout form (Sauce Demo requires first name, last name, zip)
    // ADAPT: Remove or update this block for your application's checkout flow
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('User');
    await page.getByPlaceholder('Zip/Postal Code').fill('12345');
    await page.getByRole('button', { name: 'Continue' }).click();

    // ── Step 7: Finish and validate confirmation
    await page.getByRole('button', { name: 'Finish' }).click();
    await orderValidator.verifyOrderConfirmationShown();
  });

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside homePage.verifyCartItemCount()
  test('cart reflects correct item count after adding multiple products', async ({
    loginPage,
    homePage,
  }) => {
    await loginPage.navigate();
    await loginPage.login(config.username, config.password);
    await loginPage.verifyLoginSuccess();

    // ADAPT: Use real product names from your application
    await homePage.addProductToCart('Sauce Labs Backpack');
    await homePage.addProductToCart('Sauce Labs Bike Light');

    await homePage.verifyCartItemCount(2);
  });

  // eslint-disable-next-line playwright/expect-expect -- assertions are inside homePage.verifyCartItemCount()
  test('cart icon is not visible when no products are added', async ({ loginPage, homePage }) => {
    await loginPage.navigate();
    await loginPage.login(config.username, config.password);
    await loginPage.verifyLoginSuccess();

    // No products added — cart badge must be hidden
    await homePage.verifyCartItemCount(0);
  });
});
