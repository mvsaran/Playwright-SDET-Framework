import { expect, Page } from '@playwright/test';
import { OrderResponse } from '../../api/api.types';
import { logger } from '../../utils/logger';

/**
 * OrderValidator — reusable assertions for order-related UI state.
 *
 * Responsibilities:
 *  - Encapsulate all order-related assertions in one place
 *  - Prevent duplication of the same checks across multiple specs
 *  - Accept both UI state and API response objects to cross-validate
 *
 * Used by:
 *  - checkout.flow.spec.ts
 *  - Any future order-related test
 *
 * ADAPT: Update locator strategies to match your application's order UI.
 */
export class OrderValidator {
  private readonly page: Page;
  private readonly validatorLogger = logger.child('OrderValidator');

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verify the order confirmation screen is displayed after checkout.
   * Checks for a success heading and optional order ID visibility.
   *
   * ADAPT: Update selectors to your checkout completion page.
   */
  async verifyOrderConfirmationShown(): Promise<void> {
    this.validatorLogger.info('Verifying order confirmation page');

    // ADAPT: Your completion page likely has a success heading
    const successHeading = this.page.getByRole('heading', {
      name: /thank you|order confirmed|complete/i,
    });

    await expect(successHeading).toBeVisible();
    this.validatorLogger.info('Order confirmation page verified');
  }

  /**
   * Verify that the displayed order matches the API-returned order data.
   * This demonstrates API + UI cross-validation.
   *
   * ADAPT: The fields checked here depend on what your UI displays.
   *
   * @param apiOrder - The OrderResponse returned by the API after creation
   */
  async verifyOrderMatchesApiData(apiOrder: OrderResponse): Promise<void> {
    this.validatorLogger.info('Cross-validating order UI vs API', { orderId: apiOrder.id });

    // ADAPT: Replace getByTestId selectors with your application's actual selectors
    const orderIdLocator = this.page.getByTestId('order-id');
    const orderTotalLocator = this.page.getByTestId('order-total');

    if (await orderIdLocator.isVisible()) {
      await expect(orderIdLocator).toContainText(apiOrder.id);
    }

    if (await orderTotalLocator.isVisible()) {
      await expect(orderTotalLocator).toContainText(String(apiOrder.total));
    }

    this.validatorLogger.info('Order cross-validation passed', { orderId: apiOrder.id });
  }

  /**
   * Verify order status badge/label matches the expected status.
   *
   * @param expectedStatus - The expected order status string
   */
  async verifyOrderStatus(expectedStatus: string): Promise<void> {
    this.validatorLogger.info('Verifying order status', { status: expectedStatus });

    // ADAPT: Replace this selector with your status indicator element
    const statusBadge = this.page.getByTestId('order-status');
    await expect(statusBadge).toContainText(new RegExp(expectedStatus, 'i'));
  }

  /**
   * Verify that the cart is empty after successful checkout.
   */
  async verifyCartIsEmpty(): Promise<void> {
    this.validatorLogger.info('Verifying cart is empty after checkout');

    // ADAPT: Replace with your cart empty state indicator
    const emptyCartMessage = this.page.getByText(/your cart is empty|no items/i);
    await expect(emptyCartMessage).toBeVisible();
  }
}
