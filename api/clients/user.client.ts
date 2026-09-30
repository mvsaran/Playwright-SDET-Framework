import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './api.client';
import {
  CreateUserRequest,
  UpdateUserRequest,
  UserResponse,
  PaginatedResponse,
  UserRole,
} from '../api.types';
import { assertOkAndParse, assertOkResponse } from '../../utils/api.utils';
import { logger } from '../../utils/logger';

/**
 * UserClient — CRUD operations for the /users resource.
 *
 * Responsibilities:
 *  - createUser()
 *  - getUser()
 *  - listUsers()
 *  - updateUser()
 *  - deleteUser()
 *
 * ADAPT the endpoint paths to match your application's API.
 *
 * Used by:
 *  - Fixtures: to provision test users before tests
 *  - Tests: user.lifecycle.spec.ts to validate full CRUD flows
 */
export class UserClient extends ApiClient {
  private readonly userLogger = logger.child('UserClient');

  // ── Endpoint constants ────────────────────────────────────────────────────
  // ADAPT: Change the base path to match your API version/prefix
  private static readonly BASE = '/users';

  constructor(request: APIRequestContext) {
    super(request);
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /**
   * Create a new user.
   *
   * @param payload - User creation payload from UserFactory
   * @returns The created UserResponse including the generated ID
   */
  async createUser(payload: CreateUserRequest): Promise<UserResponse> {
    this.userLogger.info('Creating user', {
      email: payload.email,
      role: payload.role ?? 'customer',
    });

    const response = await this.post(UserClient.BASE, payload);
    const raw = await assertOkAndParse<Record<string, unknown>>(response, 'POST', UserClient.BASE);

    const user: UserResponse = {
      id: String(raw['id'] ?? ''),
      firstName: String(raw['firstName'] ?? raw['first_name'] ?? payload.firstName ?? ''),
      lastName: String(raw['lastName'] ?? raw['last_name'] ?? payload.lastName ?? ''),
      email: String(raw['email'] ?? payload.email ?? ''),
      role: (raw['role'] as UserRole) ?? payload.role ?? 'customer',
      createdAt: String(raw['createdAt'] ?? new Date().toISOString()),
      updatedAt: String(raw['updatedAt'] ?? new Date().toISOString()),
    };

    this.userLogger.info('User created', { id: user.id, email: user.email });
    return user;
  }

  /**
   * Retrieve a user by ID.
   *
   * @param userId - The user's unique identifier
   */
  async getUser(userId: string): Promise<UserResponse> {
    const endpoint = `${UserClient.BASE}/${userId}`;
    this.userLogger.info('Getting user', { userId });

    const response = await this.get(endpoint);
    const raw = await assertOkAndParse<Record<string, unknown>>(response, 'GET', endpoint);
    const data = (raw['data'] as Record<string, unknown> | undefined) ?? raw;

    const user: UserResponse = {
      id: String(data['id'] ?? userId),
      firstName: String(data['first_name'] ?? data['firstName'] ?? ''),
      lastName: String(data['last_name'] ?? data['lastName'] ?? ''),
      email: String(data['email'] ?? ''),
      role: (data['role'] as UserRole) ?? 'customer',
      createdAt: String(data['createdAt'] ?? ''),
      updatedAt: String(data['updatedAt'] ?? ''),
    };

    this.userLogger.info('User retrieved', { id: user.id, email: user.email });
    return user;
  }

  /**
   * List users with optional pagination parameters.
   *
   * @param page     - Page number (1-based, default 1)
   * @param pageSize - Results per page (default 20)
   */
  async listUsers(page = 1, pageSize = 20): Promise<PaginatedResponse<UserResponse>> {
    this.userLogger.info('Listing users', { page, pageSize });

    const response = await this.get(UserClient.BASE, {
      page: String(page),
      pageSize: String(pageSize),
    });

    return assertOkAndParse<PaginatedResponse<UserResponse>>(response, 'GET', UserClient.BASE);
  }

  /**
   * Update an existing user (partial update).
   *
   * @param userId  - The user's unique identifier
   * @param payload - Fields to update
   */
  async updateUser(userId: string, payload: UpdateUserRequest): Promise<UserResponse> {
    const endpoint = `${UserClient.BASE}/${userId}`;
    this.userLogger.info('Updating user', { userId });

    const response = await this.patch(endpoint, payload);
    const raw = await assertOkAndParse<Record<string, unknown>>(response, 'PATCH', endpoint);

    const user: UserResponse = {
      id: String(raw['id'] ?? userId),
      firstName: String(raw['firstName'] ?? raw['first_name'] ?? payload.firstName ?? ''),
      lastName: String(raw['lastName'] ?? raw['last_name'] ?? payload.lastName ?? ''),
      email: String(raw['email'] ?? payload.email ?? ''),
      role: (raw['role'] as UserRole) ?? payload.role ?? 'customer',
      createdAt: String(raw['createdAt'] ?? ''),
      updatedAt: String(raw['updatedAt'] ?? new Date().toISOString()),
    };

    this.userLogger.info('User updated', { id: user.id, email: user.email });
    return user;
  }

  /**
   * Delete a user by ID.
   * Validates the response is 204 No Content or 200 OK.
   *
   * @param userId - The user's unique identifier
   */
  async deleteUser(userId: string): Promise<void> {
    const endpoint = `${UserClient.BASE}/${userId}`;
    this.userLogger.info('Deleting user', { userId });

    const response = await this.delete(endpoint);
    await assertOkResponse(response, 'DELETE', endpoint);

    this.userLogger.info('User deleted', { userId });
  }
}
