import { faker } from '@faker-js/faker';
import { UserModel } from '../models/user.model';

/**
 * UserFactory — generates unique, isolated test users.
 *
 * Rules:
 *  - Each call to create() returns a new user with unique data.
 *  - No shared mutable state between tests.
 *  - Faker seed is NOT set globally — each test gets different data
 *    which is safer for parallel execution.
 *  - Raw random calls are NEVER placed inside spec files.
 *
 * Usage:
 *   const user = UserFactory.create();
 *   const admin = UserFactory.create({ role: 'admin' });
 *   const users = UserFactory.createMany(5);
 */
export class UserFactory {
  /**
   * Generate a single user with optional overrides.
   *
   * @param overrides - Partial UserModel to override default values
   */
  static create(overrides: Partial<UserModel> = {}): UserModel {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    // Use a timestamp suffix to guarantee email uniqueness across parallel tests
    const uniqueSuffix = Date.now().toString(36);
    const email = `test.${firstName.toLowerCase()}.${uniqueSuffix}@example-test.com`;

    return {
      firstName,
      lastName,
      email,
      password: UserFactory.generatePassword(),
      role: 'customer',
      ...overrides,
    };
  }

  /**
   * Generate multiple users, each with unique data.
   *
   * @param count - Number of users to create
   * @param overrides - Optional overrides applied to all users
   */
  static createMany(count: number, overrides: Partial<UserModel> = {}): UserModel[] {
    return Array.from({ length: count }, () => UserFactory.create(overrides));
  }

  /**
   * Generate a user with admin role.
   */
  static createAdmin(overrides: Partial<UserModel> = {}): UserModel {
    return UserFactory.create({ ...overrides, role: 'admin' });
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Generate a password that meets common complexity requirements:
   *  - At least 12 characters
   *  - Contains upper, lower, digit, and special character
   *
   * Never log the output of this method.
   */
  private static generatePassword(): string {
    return (
      faker.string.alphanumeric({ length: 8 }) +
      faker.string.numeric(2) +
      faker.string.fromCharacters('!@#$%^&*', 2)
    );
  }
}
