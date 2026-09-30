/**
 * User domain model — the canonical in-test representation of a user.
 *
 * This is the model that factories produce and tests consume.
 * It is intentionally separate from the API request/response types
 * so that the model can evolve independently.
 */
export interface UserModel {
  /** Human-readable first name */
  firstName: string;
  /** Human-readable last name */
  lastName: string;
  /** Unique email address used for authentication */
  email: string;
  /** Plaintext password — used to drive login flow, never logged */
  password: string;
  /** Optional role — defaults to 'customer' */
  role?: 'admin' | 'customer' | 'guest';
}

/**
 * Represents a user that has been persisted in the system.
 * Extends the base model with server-assigned fields.
 */
export interface PersistedUser extends UserModel {
  id: string;
  createdAt: string;
  updatedAt: string;
}
