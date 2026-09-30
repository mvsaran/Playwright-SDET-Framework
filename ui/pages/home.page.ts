import { expect, Locator, Page } from '@playwright/test';
import { CartState, ProductCardState, ROUTES } from './ui.types';
import { logger } from '../../utils/logger';

/**
 * HomePage — Page Object for the main product inventory/home screen.
 *
 * Responsibilities:
 *  - Own all locators for the home/inventory page
 *  - Provide high-level product and cart actions
 *  - Provide state-reading methods used by Validators
 *
 * ADAPT: This page models a typical e-commerce inventory screen.
 * Update selectors and actions to match your application.
 */
export class HomePage {
  private readonly page: Page;
  private readonly pageLogger = logger.child('HomePage');

  // ── Locators ──────────────────────────────────────────────────────────────
  // ADAPT: Update these to match your application's actual elements

  private readonly pageTitle: Locator;
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly checkoutButton: Locator;
  private readonly productList: Locator;
  private readonly sortDropdown: Locator;

  constructor(page: Page) {
    this.page = page;

    // ADAPT: Use the visible page title text or specific heading selector
    this.pageTitle = page.getByText('Products', { exact: true });
    this.cartBadge = page.locator('.shopping_cart_badge');
    this.cartLink = page.locator('.shopping_cart_link');
    this.checkoutButton = page.getByRole('button', { name: /checkout/i });
    // ADAPT: Use the class that wraps all inventory items on your app
    this.productList = page.locator('.inventory_list, [data-test="inventory-container"]').first();
    this.sortDropdown = page.getByRole('combobox', { name: /sort/i });
  }

  // ── Navigation ────────────────────────────────────────────────────────────

  async navigate(): Promise<void> {
    this.pageLogger.info('Navigating to home page');
    await this.page.goto(ROUTES.home);
    await this.verifyPageLoaded();
  }

  // ── Product actions ───────────────────────────────────────────────────────

  /**
   * Add a product to cart by its display name.
   *
   * @param productName - The visible product name on the inventory page
   */
  async addProductToCart(productName: string): Promise<void> {
    this.pageLogger.info('Adding product to cart', { product: productName });

    // ADAPT: Adjust this locator strategy for your product list structure
    const addButton = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName })
      .getByRole('button', { name: /add to cart/i });

    await expect(addButton).toBeVisible();
    await addButton.click();

    this.pageLogger.info('Product added to cart', { product: productName });
  }

  /**
   * Remove a product from the cart by its display name.
   */
  async removeProductFromCart(productName: string): Promise<void> {
    this.pageLogger.info('Removing product from cart', { product: productName });

    const removeButton = this.page
      .locator('.inventory_item')
      .filter({ hasText: productName })
      .getByRole('button', { name: /remove/i });

    await removeButton.click();
  }

  /**
   * Navigate to the cart page.
   */
  async openCart(): Promise<void> {
    this.pageLogger.info('Opening cart');
    await this.cartLink.click();
    await this.page.waitForURL(`**${ROUTES.cart}`);
  }

  /**
   * Navigate directly to checkout (assumes cart has items).
   */
  async checkout(): Promise<void> {
    this.pageLogger.info('Starting checkout');
    await this.openCart();
    await this.checkoutButton.click();
  }

  /**
   * Sort products by a given option label.
   */
  async sortProductsBy(optionLabel: string): Promise<void> {
    this.pageLogger.info('Sorting products', { by: optionLabel });
    await this.sortDropdown.selectOption({ label: optionLabel });
  }

  // ── State reading (used by Validators) ───────────────────────────────────

  /**
   * Read the current cart state (item count and visibility).
   */
  async getCartState(): Promise<CartState> {
    const isVisible = await this.cartBadge.isVisible();
    const itemCount = isVisible ? parseInt((await this.cartBadge.textContent()) ?? '0', 10) : 0;
    return { itemCount, isVisible };
  }

  /**
   * Read the state of a specific product card.
   */
  async getProductState(productName: string): Promise<ProductCardState> {
    const card = this.page.locator('.inventory_item').filter({ hasText: productName });
    const priceLocator = card.locator('.inventory_item_price');
    const removeButton = card.getByRole('button', { name: /remove/i });

    const [price, isAddedToCart] = await Promise.all([
      priceLocator.textContent(),
      removeButton.isVisible(),
    ]);

    return {
      name: productName,
      price: price ?? '',
      isAddedToCart,
    };
  }

  // ── Assertions ────────────────────────────────────────────────────────────

  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageTitle).toBeVisible();
    await expect(this.productList).toBeVisible();
  }

  async verifyCartItemCount(expectedCount: number): Promise<void> {
    if (expectedCount === 0) {
      await expect(this.cartBadge).toBeHidden();
    } else {
      await expect(this.cartBadge).toHaveText(String(expectedCount));
    }
  }
}
