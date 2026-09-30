import { defineConfig, devices } from '@playwright/test';
import { config } from './utils/config';

/**
 * Production-grade Playwright Configuration
 *
 * Architecture:
 *  - baseURL and API base URL loaded from environment via config utility
 *  - Three browser projects: Chromium, Firefox, WebKit
 *  - Dedicated API project (no browser required)
 *  - Parallel execution with worker control
 *  - CI-aware retries, trace, screenshot and video capture
 *  - Allure + HTML dual reporting
 */
export default defineConfig({
  // ── Test Discovery ────────────────────────────────────────────────────────
  testDir: './test',
  outputDir: './test-results',

  // ── Parallelism ───────────────────────────────────────────────────────────
  fullyParallel: true,
  workers: config.workers,

  // ── CI Guards ─────────────────────────────────────────────────────────────
  // Prevents accidental .only() from blocking the CI pipeline
  forbidOnly: config.isCI,

  // ── Retries ───────────────────────────────────────────────────────────────
  // Retry once in CI to handle transient flakiness; no retries locally
  retries: config.isCI ? 1 : 0,

  // ── Timeouts ─────────────────────────────────────────────────────────────
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  // ── Reporters ─────────────────────────────────────────────────────────────
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['allure-playwright', { resultsDir: 'reports/allure/results' }],
    ['list'],
  ],

  // ── Shared Browser Settings ───────────────────────────────────────────────
  use: {
    baseURL: config.baseUrl,

    // Capture artefacts on failure or retry
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Record trace on first retry so we have a full timeline
    trace: 'on-first-retry',

    // Browser viewport
    viewport: { width: 1280, height: 720 },

    // Locale & timezone — set consistently for reproducibility
    locale: 'en-US',
    timezoneId: 'UTC',

    // Extra HTTP headers sent with every browser request
    extraHTTPHeaders: {
      Accept: 'application/json',
    },

    // Action timeout — how long Playwright waits for a single action
    actionTimeout: 15_000,

    // Navigation timeout
    navigationTimeout: 30_000,
  },

  // ── Browser Projects ──────────────────────────────────────────────────────
  projects: [
    // ── Setup project — shared auth state ───────────────────────────────────
    // Runs once before the browser projects.
    // Uncomment when you have a real app to authenticate against.
    // {
    //   name: 'setup',
    //   testMatch: /.*\.setup\.ts/,
    // },

    // ── Chromium ─────────────────────────────────────────────────────────────
    {
      name: 'chromium',
      testMatch: /.*\.flow\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // storageState: '.auth/user.json', // Enable after auth setup
      },
      // dependencies: ['setup'],
    },

    // ── Firefox ──────────────────────────────────────────────────────────────
    {
      name: 'firefox',
      testMatch: /.*\.flow\.spec\.ts/,
      use: {
        ...devices['Desktop Firefox'],
        // storageState: '.auth/user.json',
      },
      // dependencies: ['setup'],
    },

    // ── WebKit ───────────────────────────────────────────────────────────────
    {
      name: 'webkit',
      testMatch: /.*\.flow\.spec\.ts/,
      use: {
        ...devices['Desktop Safari'],
        // storageState: '.auth/user.json',
      },
      // dependencies: ['setup'],
    },

    // ── API-only project (no browser, faster) ─────────────────────────────
    {
      name: 'api',
      testMatch: /.*user\.lifecycle\.spec\.ts/,
      use: {
        // No viewport / browser needed for pure API tests
        baseURL: config.apiBaseUrl,
      },
    },
  ],
});
