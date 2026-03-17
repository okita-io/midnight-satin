/**
 * Password reset token generation, hashing, validation, and rate limiting.
 * Requirements: 2.1, 2.2, 2.6, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3
 */

import { randomBytes, createHash } from "node:crypto";
import {
  getResetTokenByHash,
  countRecentResetRequests,
  countRecentResetRequestsByIp,
} from "@/lib/db";

/** Result of a rate limit check. Requirements: 6.1, 6.2, 6.3 */
export interface RateLimitCheck {
  allowed: boolean;
  retryAfterSeconds?: number;
}

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

const EMAIL_LIMIT_PER_HOUR = 3;
const IP_LIMIT_PER_HOUR = 10;
const RATE_LIMIT_WINDOW_MINUTES = 60;

/**
 * Checks rate limits for password reset requests.
 * Enforces 3 requests per email per hour (Req 6.1) and 10 per IP per hour (Req 6.2).
 * Returns RateLimitCheck with allowed flag; when not allowed, includes retryAfterSeconds.
 */
export async function checkRateLimit(
  email: string,
  ipAddress: string
): Promise<RateLimitCheck> {
  const [emailCount, ipCount] = await Promise.all([
    countRecentResetRequests(email, RATE_LIMIT_WINDOW_MINUTES),
    countRecentResetRequestsByIp(ipAddress, RATE_LIMIT_WINDOW_MINUTES),
  ]);

  if (emailCount >= EMAIL_LIMIT_PER_HOUR || ipCount >= IP_LIMIT_PER_HOUR) {
    return {
      allowed: false,
      retryAfterSeconds: 3600, // 1 hour
    };
  }

  return { allowed: true };
}
