/**
 * Strongly-typed request/response contracts for the REST API.
 *
 * These types are used across:
 *  - API clients (api/clients/)
 *  - Test data models (test-data/models/)
 *  - Validators (ui/validators/)
 *
 * ADAPT these interfaces to match your actual API contract.
 * The structure below follows a realistic REST API pattern.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// ─── User ─────────────────────────────────────────────────────────────────────

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
}

export interface UserResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'customer' | 'guest';

// ─── Order ────────────────────────────────────────────────────────────────────

export interface CreateOrderRequest {
  userId: string;
  items: OrderItemRequest[];
  shippingAddress: Address;
}

export interface OrderItemRequest {
  productId: string;
  quantity: number;
}

export interface OrderResponse {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItemResponse[];
  total: number;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

// ─── Shared ───────────────────────────────────────────────────────────────────

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
