/**
 * TestContext — lightweight context object passed through composable fixtures.
 *
 * Rather than inflating the fixture type with every possible combination,
 * TestContext provides a structured bag of commonly needed runtime values
 * that can be assembled by individual fixtures.
 *
 * Usage:
 *   The testContext fixture is opt-in — only tests that need it declare it.
 *
 * Extension:
 *   Add new fields here when adding framework-level context (e.g. traceId,
 *   testRunId, featureFlag map, etc.). Do NOT add business domain data here.
 */
export interface TestContext {
  /** Unique identifier for this test run (useful for log correlation) */
  testRunId: string;

  /** The test environment this run targets */
  testEnv: string;

  /** Whether this execution is happening in CI */
  isCI: boolean;

  /**
   * Extension point: arbitrary key-value metadata.
   * Use this for short-lived per-test state that doesn't warrant a new fixture field.
   *
   * Example:
   *   context.metadata.featureFlags = 'checkout-v2,new-header';
   */
  metadata: Record<string, string>;
}

/**
 * Factory function that creates a fresh TestContext for each test.
 */
export function createTestContext(overrides: Partial<TestContext> = {}): TestContext {
  return {
    testRunId: `run-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    testEnv: process.env['TEST_ENV'] ?? 'local',
    isCI: process.env['CI'] === 'true',
    metadata: {},
    ...overrides,
  };
}
