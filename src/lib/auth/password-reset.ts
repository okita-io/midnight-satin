/**
 * Password reset token generation, hashing, validation, and rate limiting.
 * Requirements: 2.1, 2.2, 2.6, 4.1, 4.2, 4.3, 4.4, 5.2, 5.3, 6.1, 6.2, 6.3
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

/** Minimum password length for reset. Requirements: 5.2 */
export const MIN_PASSWORD_LENGTH = 8;

/** Result of validating password reset input. Requirements: 5.2, 5.3 */
export type PasswordResetValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Validates password and confirmation for reset form.
 * Enforces minimum 8 characters (Req 5.2) and matching confirmation (Req 5.3).
 * Pure function — no DB or side effects.
 */
export function validatePasswordForReset(
  password: string,
  confirmPassword: string
): PasswordResetValidationResult {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { valid: false, error: "Password must be at least 8 characters." };
  }
  if (password !== confirmPassword) {
    return { valid: false, error: "Passwords do not match." };
  }
  return { valid: true };
}

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
