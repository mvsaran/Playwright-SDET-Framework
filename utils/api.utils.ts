import { APIResponse } from '@playwright/test';
import { logger } from './logger';

/**
 * Shared API utilities.
 *
 * These helpers wrap low-level Playwright APIRequestContext operations to:
 *  - provide consistent error messages
 *  - handle non-2xx responses uniformly
 *  - log request/response metadata without leaking secrets
 */

// ─── Response helpers ─────────────────────────────────────────────────────────

/**
 * Assert the response has a 2xx status code.
 * Throws a descriptive error if not, including the endpoint and actual status.
 */
export async function assertOkResponse(
  response: APIResponse,
  method: string,
  endpoint: string,
): Promise<void> {
  if (!response.ok()) {
    const body = await safeReadBody(response);
    throw new Error(
      `[ApiUtils] ${method} ${endpoint} failed.\n` +
        `  Expected: 2xx\n` +
        `  Received: ${response.status()}\n` +
        `  Body: ${body}`,
    );
  }
}

/**
 * Parse a JSON response body with a typed generic.
 * Throws a descriptive error if parsing fails.
 */
export async function parseJson<T>(response: APIResponse, endpoint: string): Promise<T> {
  try {
    return (await response.json()) as T;
  } catch {
    throw new Error(
      `[ApiUtils] Failed to parse JSON response from ${endpoint}.\n` +
        `  Status: ${response.status()}`,
    );
  }
}

/**
 * Assert OK and parse the JSON body in one call.
 */
export async function assertOkAndParse<T>(
  response: APIResponse,
  method: string,
  endpoint: string,
): Promise<T> {
  logger.apiResponse(method, endpoint, response.status());
  await assertOkResponse(response, method, endpoint);
  return parseJson<T>(response, endpoint);
}

/**
 * Safely read a response body as text.
 * Does not throw even if body cannot be read.
 */
async function safeReadBody(response: APIResponse): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '<unreadable body>';
  }
}

// ─── URL helpers ──────────────────────────────────────────────────────────────

/**
 * Build a URL by joining a base and a path segment.
 * Avoids double-slashes while keeping protocol intact.
 */
export function buildUrl(base: string, path: string): string {
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

/**
 * Append query parameters to a URL string.
 */
export function appendQueryParams(
  url: string,
  params: Record<string, string | number | boolean>,
): string {
  const searchParams = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>((acc, [k, v]) => {
      acc[k] = String(v);
      return acc;
    }, {}),
  );
  return `${url}?${searchParams.toString()}`;
}
