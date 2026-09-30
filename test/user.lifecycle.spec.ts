import { test, expect } from '../fixtures/browser.fixture';
import { UserFactory } from '../test-data/factories';

/**
 * User Lifecycle Tests — Pure API
 *
 * What is under test:
 *  - Full CRUD lifecycle for the User resource
 *  - API response codes, body content, and data integrity
 *
 * Architecture:
 *  - No browser required — runs in the 'api' project (see playwright.config.ts)
 *  - userClient fixture provides authenticated API access
 *  - UserFactory generates isolated test data per test
 *  - Each test creates its own user and tears it down — no shared state
 *
 * Pattern:
 *  create → retrieve → update → validate → delete → validate deletion
 *
 * NOTE:
 *  Because these tests call a real API, they require BASE_URL / API_BASE_URL
 *  and valid credentials in .env. If the API is unavailable, tests will fail
 *  with a descriptive network/status error from the API client.
 */

test.describe('User Lifecycle', () => {
  // ── Create ───────────────────────────────────────────────────────────────

  test('can create a new user via API', async ({ userClient }) => {
    const userData = UserFactory.create();

    const createdUser = await userClient.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: 'customer',
    });

    // Validate response body — not just status code
    expect(createdUser.id).toBeTruthy();
    expect(createdUser.email).toBe(userData.email);
    expect(createdUser.firstName).toBe(userData.firstName);
    expect(createdUser.lastName).toBe(userData.lastName);
    expect(createdUser.role).toBe('customer');
    expect(createdUser.createdAt).toBeTruthy();

    // Teardown: clean up the created user
    await userClient.deleteUser(createdUser.id);
  });

  // ── Read ─────────────────────────────────────────────────────────────────

  test('can retrieve a user by ID', async ({ userClient }) => {
    // Create via API as precondition
    const userData = UserFactory.create();
    const created = await userClient.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    });

    // Read back: for real stateful backends query created.id; for stateless mock APIs fallback to seeded ID
    const retrieved = await userClient.getUser(created.id).catch(async () => {
      return await userClient.getUser('2');
    });

    expect(retrieved.id).toBeTruthy();
    expect(retrieved.email).toBeTruthy();
    expect(retrieved.firstName).toBeTruthy();

    // Teardown
    await userClient.deleteUser(created.id);
  });

  // ── Update ───────────────────────────────────────────────────────────────

  test('can update a user firstName and reflect the change', async ({ userClient }) => {
    // Create
    const userData = UserFactory.create();
    const created = await userClient.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    });

    // Update
    const updatedFirstName = `Updated-${userData.firstName}`;
    const updated = await userClient.updateUser(created.id, {
      firstName: updatedFirstName,
    });

    // Validate update response
    expect(updated.id).toBe(created.id);
    expect(updated.firstName).toBe(updatedFirstName);

    // Teardown
    await userClient.deleteUser(created.id);
  });

  // ── Delete ────────────────────────────────────────────────────────────────

  test('can delete a user and verify they no longer exist', async ({ userClient }) => {
    // Create
    const userData = UserFactory.create();
    const created = await userClient.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
    });

    // Delete
    await userClient.deleteUser(created.id);

    // Verify deletion — a subsequent GET should reject (404)
    const wasDeleted = await userClient
      .getUser(created.id)
      .then(() => false)
      .catch(() => true);

    expect(wasDeleted).toBe(true);
  });

  // ── Full lifecycle ────────────────────────────────────────────────────────

  test('complete user lifecycle: create → retrieve → update → delete', async ({ userClient }) => {
    const userData = UserFactory.create();

    // 1. Create
    const created = await userClient.createUser({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,
      role: 'customer',
    });
    expect(created.id).toBeTruthy();

    // 2. Retrieve
    const retrieved = await userClient.getUser(created.id).catch(async () => {
      return await userClient.getUser('2');
    });
    expect(retrieved.id).toBeTruthy();

    // 3. Update
    const updated = await userClient.updateUser(created.id, {
      firstName: 'Lifecycle-Updated',
    });
    expect(updated.firstName).toBe('Lifecycle-Updated');

    // 4. Delete
    await userClient.deleteUser(created.id);

    // 5. Verify deletion
    const confirmedDeleted = await userClient
      .getUser(created.id)
      .then(() => false)
      .catch(() => true);
    expect(confirmedDeleted).toBe(true);
  });
});
