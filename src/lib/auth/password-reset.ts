/**
 * Password reset token generation and hashing.
 * Requirements: 2.1, 2.2, 2.6
 */

import { randomBytes, createHash } from "node:crypto";

/** Result of generating a reset token: plaintext for the link, hash for storage. */
export interface ResetTokenResult {
  /** Base64url-encoded token to include in the reset link (sent via email). */
  token: string;
  /** SHA-256 hash of the token for secure database storage. */
  tokenHash: string;
}

const TOKEN_BYTES = 32;

/**
 * Generates a cryptographically secure reset token.
 * Uses 32 random bytes encoded as base64url for URL-safe inclusion in reset links.
 * Returns both the plaintext token (for the email link) and its hash (for DB storage).
 */
export function generateResetToken(): ResetTokenResult {
  const bytes = randomBytes(TOKEN_BYTES);
  const token = bytes.toString("base64url");
  const tokenHash = hashToken(token);
  return { token, tokenHash };
}

/**
 * Hashes a token using SHA-256.
 * Used when storing tokens (from generateResetToken) or when verifying
 * a token from a reset link against the stored hash.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}
