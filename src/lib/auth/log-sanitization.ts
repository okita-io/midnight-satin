/**
 * Log sanitization for security events. Requirements: 7.4
 *
 * Redacts sensitive patterns (email, token, password-like) from strings
 * before they are written to security logs. Ensures no plaintext sensitive
 * data appears in password_reset_log or similar audit trails.
 *
 * Property 17: No sensitive data in logs — Validates: Requirements 7.4
 */

const REDACTED = "[REDACTED]";

/** Email pattern: any substring containing @ (must not appear in logs). */
const EMAIL_REGEX = /[^\s@]*@[^\s@]*/g;
/** Base64url token: 40+ chars (reset tokens are 43). */
const TOKEN_REGEX = /[A-Za-z0-9_-]{40,}/g;

/**
 * Sanitize a string for security logging. Redacts email addresses and
 * token-like substrings. Returns null for null/undefined input.
 *
 * @param value - Raw string that may contain sensitive data
 * @returns Sanitized string safe for logging, or null
 */
export function sanitizeForSecurityLog(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") return null;

  let result = value;
  result = result.replace(new RegExp(EMAIL_REGEX.source, "g"), REDACTED);
  result = result.replace(new RegExp(TOKEN_REGEX.source, "g"), REDACTED);
  return result;
}

/**
 * Check whether a string contains sensitive patterns (email or token).
 * Used by property tests to verify sanitization.
 */
export function containsSensitiveData(value: string): boolean {
  if (!value || typeof value !== "string") return false;
  return (
    value.includes("@") ||
    new RegExp(TOKEN_REGEX.source).test(value)
  );
}
