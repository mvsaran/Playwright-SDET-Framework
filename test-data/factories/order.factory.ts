import { faker } from '@faker-js/faker';
import { OrderModel, OrderItemModel, AddressModel } from '../models/order.model';

/**
 * OrderFactory — generates unique, isolated test orders.
 *
 * Rules:
 *  - Each call to create() returns a new order with unique data.
 *  - userId must always be explicitly provided — the factory
 *    never infers it to keep data flow explicit and traceable.
 *
 * Usage:
 *   const order = OrderFactory.create({ userId: createdUser.id });
 *   const bulkOrder = OrderFactory.create({ userId, items: OrderFactory.createItems(5) });
 */
export class OrderFactory {
  /**
   * Generate a single order for a given user.
   *
   * @param overrides - Partial OrderModel; userId is required
   */
  static create(overrides: Partial<OrderModel> & { userId: string }): OrderModel {
    return {
      userId: overrides.userId,
      items: overrides.items ?? OrderFactory.createItems(1),
      shippingAddress: overrides.shippingAddress ?? OrderFactory.createAddress(),
    };
  }

  /**
   * Generate an array of order line items.
   *
   * @param count - Number of items (default 1)
   */
  static createItems(count = 1): OrderItemModel[] {
    return Array.from({ length: count }, () => ({
      // ADAPT: Replace with real product IDs from your catalogue
      productId: `prod-${faker.string.alphanumeric(8).toUpperCase()}`,
      quantity: faker.number.int({ min: 1, max: 5 }),
    }));
  }

  /**
   * Generate a random shipping address.
   */
  static createAddress(): AddressModel {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      zipCode: faker.location.zipCode('#####'),
      country: 'US',
    };
  }
}
