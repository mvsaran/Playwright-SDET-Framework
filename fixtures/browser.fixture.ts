import { test as base, APIRequestContext } from '@playwright/test';
import { LoginPage } from '../ui/pages/login.page';
import { HomePage } from '../ui/pages/home.page';
import { AuthClient } from '../api/clients/auth.client';
import { UserClient } from '../api/clients/user.client';
import { UserFactory } from '../test-data/factories/user.factory';
import { UserModel, PersistedUser } from '../test-data/models/user.model';
import { config } from '../utils/config';
import { logger } from '../utils/logger';

/**
 * Custom fixture type definitions.
 *
 * Every test in the framework receives these fixtures automatically
 * when they declare them in the test function signature.
 *
 * Architecture:
 *   test → fixture → page object / API client / factory
 *
 * Scopes used:
 *  - 'test'   : Created fresh for each test (default — safest for parallelism)
 *  - 'worker' : Shared across tests in the same worker process
 *
 * Fixtures are COMPOSABLE — each fixture may depend on others.
 * Do NOT create god fixtures that do everything.
 */

export interface TestFixtures {
  // ── Page Objects ───────────────────────────────────────────────────────────
  loginPage: LoginPage;
  homePage: HomePage;

  // ── API Clients ────────────────────────────────────────────────────────────
  authClient: AuthClient;
  userClient: UserClient;

  // ── Test Data ─────────────────────────────────────────────────────────────
  /** A fresh user model (not yet created in the system) */
  freshUser: UserModel;
  /** A user that has been created via API and cleaned up after the test */
  testUser: PersistedUser;
  /** An authenticated API context (logged in as the test user) */
  authenticatedRequest: APIRequestContext;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface WorkerFixtures {
  // Worker-scoped fixtures go here (e.g., shared browser session)
  // Currently empty — extend as needed
}

/**
 * Extended test function with all custom fixtures attached.
 *
 * Import this `test` in all spec files instead of '@playwright/test'.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/browser.fixture';
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  // ── Page Object fixtures ──────────────────────────────────────────────────

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },

  // ── API Client fixtures ───────────────────────────────────────────────────

  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  userClient: async ({ request }, use) => {
    await use(new UserClient(request));
  },

  // ── Test data fixtures ────────────────────────────────────────────────────

  /**
   * Generates a fresh user model (not persisted) using the factory.
   * Use this when you need the model before API creation (e.g., to test registration).
   */
  freshUser: async ({}, use) => {
    const user = UserFactory.create();
    await use(user);
  },

  /**
   * Creates a test user via API before the test and deletes it afterward.
   *
   * This ensures:
   *  - Complete test isolation (each test owns its own user)
   *  - No leftover data after test completion
   *  - No UI clicks needed to create preconditions
   *
   * NOTE: Requires the API to be reachable and the AUTH_TOKEN to be valid.
   * If the API requires authentication to create users, use `authenticatedRequest`
   * inside this fixture.
   */
  testUser: async ({ request }, use) => {
    const userModel = UserFactory.create();
    const userClient = new UserClient(request);

    // Authenticate the client if the create-user endpoint requires auth
    // const authClient = new AuthClient(request);
    // await authClient.login(config.username, config.password);
    // userClient.setAccessToken(authClient... ); // propagate token if needed

    logger.info('Fixture: creating test user via API', { email: userModel.email });
    const createdUser = await userClient.createUser({
      firstName: userModel.firstName,
      lastName: userModel.lastName,
      email: userModel.email,
      password: userModel.password,
      role: userModel.role ?? 'customer',
    });

    const persistedUser: PersistedUser = {
      ...userModel,
      id: createdUser.id,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };

    logger.info('Fixture: test user created', { id: persistedUser.id, email: persistedUser.email });

    await use(persistedUser);

    // ── Teardown ────────────────────────────────────────────────────────────
    logger.info('Fixture: deleting test user via API', { id: persistedUser.id });
    await userClient.deleteUser(persistedUser.id).catch((err: unknown) => {
      // Log but don't fail the test on cleanup error
      logger.warn('Fixture: failed to clean up test user', {
        id: persistedUser.id,
        error: String(err),
      });
    });
  },

  /**
   * An APIRequestContext that is pre-authenticated with the default test credentials.
   * Use this when you need to make authenticated API calls without creating a full user.
   */
  authenticatedRequest: async ({ request }, use) => {
    const authClient = new AuthClient(request);
    await authClient.login(config.username, config.password);
    // The token is stored on the authClient; for raw APIRequestContext access,
    // pass the authClient itself or use the AuthClient methods.
    // This fixture surfaces the raw request for advanced use cases.
    await use(request);
  },
});

// Re-export expect so specs only need one import
export { expect } from '@playwright/test';
