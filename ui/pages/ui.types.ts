/**
 * UI-layer type definitions.
 *
 * These types describe what page objects surface to the test layer.
 * They are separate from API types to keep the layers independent.
 */

/** Represents the visible state of the cart header badge */
export interface CartState {
  itemCount: number;
  isVisible: boolean;
}

/** Represents a product card as it appears on the inventory page */
export interface ProductCardState {
  name: string;
  price: string;
  isAddedToCart: boolean;
}

/** Page navigation paths — ADAPT to match your application routes */
export const ROUTES = {
  // ADAPT: Sauce Demo uses root for login and .html extensions
  login: '/',
  home: '/inventory.html',
  cart: '/cart.html',
  checkout: '/checkout-step-one.html',
  checkoutComplete: '/checkout-complete.html',
  profile: '/profile',
} as const;

export type Route = (typeof ROUTES)[keyof typeof ROUTES];
