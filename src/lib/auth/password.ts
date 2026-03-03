import { hash as bcryptHash, compare as bcryptCompare } from "bcryptjs";

const SALT_ROUNDS = 10;

/** Hash a plaintext password. Never store plaintext. */
export async function hashPassword(plain: string): Promise<string> {
  return bcryptHash(plain, SALT_ROUNDS);
}

/** Verify plaintext against a stored hash. Returns true if match. */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcryptCompare(plain, hashed);
}
