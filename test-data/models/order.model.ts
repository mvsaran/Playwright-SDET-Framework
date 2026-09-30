/**
 * Order domain model — the canonical in-test representation of an order.
 */
export interface OrderItemModel {
  productId: string;
  quantity: number;
}

export interface AddressModel {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface OrderModel {
  /** ID of the user who placed the order */
  userId: string;
  /** Line items in the order */
  items: OrderItemModel[];
  /** Shipping destination */
  shippingAddress: AddressModel;
}

/**
 * Represents an order that has been persisted in the system.
 */
export interface PersistedOrder extends OrderModel {
  id: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  createdAt: string;
}
