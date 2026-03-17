/**
 * Password reset token generation, hashing, and validation.
 * Requirements: 2.1, 2.2, 2.6, 4.1, 4.2, 4.3, 4.4
 */

import { randomBytes, createHash } from "node:crypto";
import { getResetTokenByHash } from "@/lib/db";

/** Result of generating a reset token: plaintext for the link, hash for storage. */
export interface ResetTokenResult {
  /** Base64url-encoded token to include in the reset link (sent via email). */
  token: string;
  /** SHA-256 hash of the token for secure database storage. */
  tokenHash: string;
}

/** Result of validating a reset token. Requirements: 4.1, 4.2, 4.3, 4.4 */
export interface TokenValidationResult {
  valid: boolean;
  readerId?: string;
  error?: "invalid" | "expired" | "used";
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

/**
 * Validates a reset token from a URL against the database.
 * Checks existence (Req 4.1), expiry (Req 4.2), and used status (Req 4.3, 4.4).
 * Returns TokenValidationResult with valid flag and optional error type.
 */
export async function validateResetToken(
  rawToken: string
): Promise<TokenValidationResult> {
  const tokenHash = hashToken(rawToken);
  const row = await getResetTokenByHash(tokenHash);

  if (!row) {
    return { valid: false, error: "invalid" };
  }

  if (row.usedAt !== null) {
    return { valid: false, error: "used" };
  }

  if (new Date() > row.expiresAt) {
    return { valid: false, error: "expired" };
  }

  return { valid: true, readerId: row.readerId };
}
