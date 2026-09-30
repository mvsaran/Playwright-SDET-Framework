/**
 * Common framework utilities.
 *
 * These are pure functions with no Playwright or test-runner dependency.
 * They can be used safely in factories, validators, and page objects.
 */

// ─── Retry ───────────────────────────────────────────────────────────────────

/**
 * Retry an async operation up to `attempts` times with exponential back-off.
 * Use sparingly — prefer Playwright auto-waiting for UI operations.
 *
 * @param operation - Async function to retry
 * @param attempts  - Maximum number of attempts (default 3)
 * @param delayMs   - Initial delay in milliseconds (default 500)
 */
export async function retry<T>(
  operation: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: Error | undefined;
  for (let i = 1; i <= attempts; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (i < attempts) {
        await sleep(delayMs * i); // exponential back-off
      }
    }
  }
  throw new Error(
    `[CommonUtils] Operation failed after ${attempts} attempts.\n  Last error: ${lastError?.message ?? 'unknown'}`,
  );
}

/**
 * Sleep for a given number of milliseconds.
 *
 * NOTE: Prefer Playwright auto-waiting and web-first assertions over
 * explicit sleeps. Only use this for non-UI polling scenarios such as
 * waiting for an async background job.
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── String helpers ───────────────────────────────────────────────────────────

/**
 * Mask a string so that only the first and last characters are visible.
 * Use this when you need to reference an identifier in logs without
 * printing sensitive data.
 *
 * Example: mask('secret123') → 's*******3'
 */
export function mask(value: string): string {
  if (value.length <= 2) {
    return '***';
  }
  return `${value[0]}${'*'.repeat(value.length - 2)}${value[value.length - 1]}`;
}

/**
 * Generate a timestamp-based unique string suitable for test data
 * identifiers where you want deterministic-ish uniqueness without Faker.
 */
export function uniqueId(prefix = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Object helpers ───────────────────────────────────────────────────────────

/**
 * Perform a deep partial match: assert that `actual` contains all keys/values
 * specified in `expected`. Additional keys in `actual` are allowed.
 *
 * Throws with a descriptive message rather than returning false so that
 * failures surface clearly in test output.
 */
export function assertDeepContains<T extends object>(
  actual: T,
  expected: Partial<T>,
  label = 'Object',
): void {
  for (const [key, value] of Object.entries(expected)) {
    const actualValue = (actual as Record<string, unknown>)[key];
    if (JSON.stringify(actualValue) !== JSON.stringify(value)) {
      throw new Error(
        `[CommonUtils] ${label} mismatch on field "${key}".\n` +
          `  Expected: ${JSON.stringify(value)}\n` +
          `  Received: ${JSON.stringify(actualValue)}`,
      );
    }
  }
}
