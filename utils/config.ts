import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from the project root (not process.cwd() which may vary)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// ─── Type definitions ─────────────────────────────────────────────────────────

export interface FrameworkConfig {
  /** Base URL of the web application under test */
  readonly baseUrl: string;
  /** Base URL of the REST API under test */
  readonly apiBaseUrl: string;
  /** Default test username — sourced from TEST_USERNAME env var */
  readonly username: string;
  /** Default test password — sourced from TEST_PASSWORD env var */
  readonly password: string;
  /** Target test environment (local | dev | staging | prod) */
  readonly testEnv: string;
  /** True when running inside a CI environment */
  readonly isCI: boolean;
  /** Number of parallel workers */
  readonly workers: number;
}

// ─── Guard helpers ────────────────────────────────────────────────────────────

/**
 * Asserts that a required environment variable is present and non-empty.
 * Throws with a descriptive error rather than propagating an `undefined` type error
 * deep inside the framework.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(
      `[Config] Required environment variable "${key}" is missing or empty.\n` +
        `  → Copy .env.example to .env and fill in a value for ${key}.\n` +
        `  → In CI, add it as a repository secret / environment variable.`,
    );
  }
  return value.trim();
}

/**
 * Reads an optional environment variable, returning `fallback` if absent.
 */
function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.trim() !== '' ? value.trim() : fallback;
}

// ─── Config object ────────────────────────────────────────────────────────────

/**
 * Centralised, validated framework configuration.
 *
 * IMPORTANT:
 *  - This module never prints credentials to stdout.
 *  - All values are read-only to prevent accidental mutation.
 */
export const config: FrameworkConfig = {
  baseUrl: requireEnv('BASE_URL'),
  apiBaseUrl: requireEnv('API_BASE_URL'),
  username: requireEnv('TEST_USERNAME'),
  // Password is required but intentionally NEVER logged anywhere
  password: requireEnv('TEST_PASSWORD'),
  testEnv: optionalEnv('TEST_ENV', 'local'),
  isCI: process.env['CI'] === 'true',
  workers: parseInt(optionalEnv('WORKERS', '4'), 10),
};
