import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../../utils/config';
import { logger } from '../../utils/logger';

/**
 * Base API client — shared infrastructure for all API clients.
 *
 * Responsibilities:
 *  - Holds the Playwright APIRequestContext
 *  - Manages the Authorization header
 *  - Provides generic get/post/put/patch/delete methods with logging
 *  - Handles common error formatting
 *
 * IMPORTANT:
 *  - This class does NOT know about any specific API domain (users, orders, etc.)
 *  - Domain-specific logic lives in subclasses
 *  - Credentials are NEVER logged
 */
export class ApiClient {
  protected readonly request: APIRequestContext;
  protected readonly baseUrl: string;
  private readonly clientLogger = logger.child('ApiClient');

  private accessToken: string | null = null;

  constructor(request: APIRequestContext, baseUrl?: string) {
    this.request = request;
    this.baseUrl = baseUrl ?? config.apiBaseUrl;
  }

  // ── Authentication ────────────────────────────────────────────────────────

  /**
   * Store an access token that will be attached as a Bearer header
   * on every subsequent request.
   *
   * NOTE: The token is stored in-memory only — never written to disk.
   */
  setAccessToken(token: string): void {
    this.accessToken = token;
    this.clientLogger.info('Access token set (value masked)', { masked: '***' });
  }

  clearAccessToken(): void {
    this.accessToken = null;
    this.clientLogger.info('Access token cleared');
  }

  // ── Generic HTTP methods ──────────────────────────────────────────────────

  protected async get(path: string, params?: Record<string, string>): Promise<APIResponse> {
    const url = this.buildUrl(path);
    this.clientLogger.apiRequest('GET', url);
    return this.request.get(url, {
      headers: this.buildHeaders(),
      params,
    });
  }

  protected async post(path: string, data: unknown): Promise<APIResponse> {
    const url = this.buildUrl(path);
    this.clientLogger.apiRequest('POST', url);
    return this.request.post(url, {
      headers: this.buildHeaders(),
      data,
    });
  }

  protected async put(path: string, data: unknown): Promise<APIResponse> {
    const url = this.buildUrl(path);
    this.clientLogger.apiRequest('PUT', url);
    return this.request.put(url, {
      headers: this.buildHeaders(),
      data,
    });
  }

  protected async patch(path: string, data: unknown): Promise<APIResponse> {
    const url = this.buildUrl(path);
    this.clientLogger.apiRequest('PATCH', url);
    return this.request.patch(url, {
      headers: this.buildHeaders(),
      data,
    });
  }

  protected async delete(path: string): Promise<APIResponse> {
    const url = this.buildUrl(path);
    this.clientLogger.apiRequest('DELETE', url);
    return this.request.delete(url, {
      headers: this.buildHeaders(),
    });
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private buildUrl(path: string): string {
    return `${this.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }

  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    return headers;
  }
}
