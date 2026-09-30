import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './api.client';
import { LoginRequest, LoginResponse, RefreshTokenRequest } from '../api.types';
import { assertOkAndParse } from '../../utils/api.utils';
import { logger } from '../../utils/logger';

/**
 * AuthClient — handles all authentication-related API operations.
 *
 * Responsibilities:
 *  - POST /auth/login
 *  - POST /auth/refresh
 *  - POST /auth/logout
 *
 * The parent ApiClient stores the resulting token and attaches it to
 * subsequent requests. Credentials are NEVER logged.
 *
 * ADAPT the endpoint paths to match your application's auth API.
 * Common patterns:
 *   POST /auth/login          → loginRequest body
 *   POST /api/v1/auth/token   → OAuth-style
 *   POST /users/sign_in       → Rails Devise
 */
export class AuthClient extends ApiClient {
  private readonly authLogger = logger.child('AuthClient');

  // ── Endpoint constants ────────────────────────────────────────────────────
  // ADAPT: Change these to match your application
  private static readonly ENDPOINTS = {
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
  } as const;

  constructor(request: APIRequestContext) {
    super(request);
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /**
   * Authenticate with username + password.
   * Automatically stores the access token on the parent ApiClient.
   *
   * @param username - Test user email/username (from test data factory)
   * @param password - Test user password (from test data factory)
   * @returns LoginResponse containing accessToken, refreshToken, etc.
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    this.authLogger.info('Logging in', { username });
    // Password intentionally excluded from the log context above

    const body: LoginRequest = { username, password };
    const response = await this.post(AuthClient.ENDPOINTS.login, body);

    const loginResponse = await assertOkAndParse<LoginResponse>(
      response,
      'POST',
      AuthClient.ENDPOINTS.login,
    );

    this.setAccessToken(loginResponse.accessToken);
    this.authLogger.info('Login successful', { username, tokenType: loginResponse.tokenType });

    return loginResponse;
  }

  /**
   * Refresh an existing session using a refresh token.
   *
   * @param refreshToken - Token obtained from a prior login response
   */
  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    this.authLogger.info('Refreshing token');

    const body: RefreshTokenRequest = { refreshToken };
    const response = await this.post(AuthClient.ENDPOINTS.refresh, body);

    const refreshResponse = await assertOkAndParse<LoginResponse>(
      response,
      'POST',
      AuthClient.ENDPOINTS.refresh,
    );

    this.setAccessToken(refreshResponse.accessToken);
    this.authLogger.info('Token refresh successful');

    return refreshResponse;
  }

  /**
   * Logout the current session.
   */
  async logout(): Promise<void> {
    this.authLogger.info('Logging out');
    const response = await this.post(AuthClient.ENDPOINTS.logout, {});
    if (!response.ok()) {
      this.authLogger.warn('Logout returned non-2xx status', { status: response.status() });
    }
    this.clearAccessToken();
    this.authLogger.info('Logout complete');
  }
}
