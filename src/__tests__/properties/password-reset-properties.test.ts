/**
 * Property 1: Valid email acceptance
 * Validates: Requirements 1.3 (Email Password Reset)
 *
 * For any string that matches a valid email format (contains @, domain part,
 * no whitespace), isValidEmail SHALL return true. Submitting such a string
 * to the reset request form should not produce a validation error.
 *
 * Property 2: Invalid email rejection
 * Validates: Requirements 1.4 (Email Password Reset)
 *
 * For any string that does not match a valid email format (missing @,
 * whitespace-only, empty), isValidEmail SHALL return false. Submitting such
 * a string to the reset request form should produce a validation error and
 * not trigger any token generation.
 *
 * Property 3: Response uniformity
 * Validates: Requirements 1.5, 6.3 (Email Password Reset)
 *
 * For any email submission to the reset request form — whether the email exists
 * in the system, does not exist, or is rate-limited — the user-facing response
 * message SHALL be identical. Prevents email enumeration and timing attacks.
 */

import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "@/app/actions/password-reset";
import { isValidEmail } from "@/lib/auth/email-validation";
import * as fc from "fast-check";

const GENERIC_SUCCESS_MESSAGE =
  "If an account with that email exists, we've sent a reset link.";

const INVALID_TOKEN_MESSAGE =
  "This reset link is no longer valid. Please request a new one.";

// Mock next/headers for server action (no request context in Vitest)
vi.mock("next/headers", () => ({
  headers: () =>
    Promise.resolve({
      get: (key: string) =>
        key === "x-forwarded-for" ? "192.168.1.100" : key === "x-real-ip" ? null : null,
    }),
}));

describe("Property 1: Valid email acceptance", () => {
  it("Feature: password-recovery-resend, Property 1: Valid email acceptance — any valid format string is accepted", () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        expect(isValidEmail(email)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("local@domain.tld format with various local/domain/tld combinations is accepted", () => {
    const safeChar = fc.constantFrom(
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789._+-"
    );
    const localPart = fc
      .array(safeChar, { minLength: 1, maxLength: 64 })
      .map((arr) => arr.join(""));
    const domainPart = fc
      .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789-"), {
        minLength: 1,
        maxLength: 64,
      })
      .map((arr) => arr.join(""));
    const tldPart = fc
      .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz"), {
        minLength: 1,
        maxLength: 24,
      })
      .map((arr) => arr.join(""));
    const validEmailArb = fc
      .tuple(localPart, domainPart, tldPart)
      .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

    fc.assert(
      fc.property(validEmailArb, (email) => {
        expect(isValidEmail(email)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 2: Invalid email rejection", () => {
  it("Feature: password-recovery-resend, Property 2: Invalid email rejection — empty and whitespace-only are rejected", () => {
    const emptyOrWhitespace = fc.oneof(
      fc.constant(""),
      fc.integer({ min: 1, max: 20 }).map((n) => " ".repeat(n)),
      fc.integer({ min: 1, max: 10 }).map((n) => "\t".repeat(n))
    );
    fc.assert(
      fc.property(emptyOrWhitespace, (s) => {
        expect(isValidEmail(s)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("strings without @ are rejected", () => {
    const noAtChar = fc.constantFrom(
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .!-"
    );
    const noAtString = fc
      .array(noAtChar, { minLength: 1, maxLength: 64 })
      .map((arr) => arr.join(""));
    fc.assert(
      fc.property(noAtString, (s) => {
        expect(isValidEmail(s)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("strings with @ but no domain dot (e.g. a@b) are rejected", () => {
    const safeChar = fc.constantFrom(
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    );
    const localPart = fc
      .array(safeChar, { minLength: 1, maxLength: 32 })
      .map((arr) => arr.join(""));
    const domainNoDot = fc
      .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"), {
        minLength: 1,
        maxLength: 32,
      })
      .map((arr) => arr.join(""));
    const noTld = fc.tuple(localPart, domainNoDot).map(([local, domain]) => `${local}@${domain}`);
    fc.assert(
      fc.property(noTld, (s) => {
        expect(isValidEmail(s)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("strings with whitespace in middle of local or domain part are rejected", () => {
    const safeChar = fc.constantFrom(
      ..."abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    );
    const withSpace = fc.oneof(
      fc
        .tuple(
          fc.array(safeChar, { minLength: 1, maxLength: 16 }).map((arr) => arr.join("")),
          fc.constant(" "),
          fc.array(safeChar, { minLength: 1, maxLength: 16 }).map((arr) => arr.join("")),
          fc.constant("@"),
          fc
            .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"), {
              minLength: 1,
              maxLength: 16,
            })
            .map((arr) => arr.join("")),
          fc.constant("."),
          fc
            .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz"), {
              minLength: 1,
              maxLength: 8,
            })
            .map((arr) => arr.join(""))
        )
        .map((parts) => parts.join("")),
      fc
        .tuple(
          fc.array(safeChar, { minLength: 1, maxLength: 16 }).map((arr) => arr.join("")),
          fc.constant("@"),
          fc
            .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"), {
              minLength: 1,
              maxLength: 16,
            })
            .map((arr) => arr.join("")),
          fc.constant(" "),
          fc
            .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789"), {
              minLength: 1,
              maxLength: 16,
            })
            .map((arr) => arr.join("")),
          fc.constant("."),
          fc
            .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz"), {
              minLength: 1,
              maxLength: 8,
            })
            .map((arr) => arr.join(""))
        )
        .map((parts) => parts.join(""))
    );
    fc.assert(
      fc.property(withSpace, (s) => {
        expect(isValidEmail(s)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 3: Response uniformity", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Disable Resend so we don't send real emails; action still returns generic success
    process.env.RESEND_API_KEY = "";
    process.env.RESEND_FROM_EMAIL = "";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.skipIf(!hasPostgres)(
    "Feature: password-recovery-resend, Property 3: Response uniformity — email exists, email not exists, and rate-limited all return identical message",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid().map((u) => `prop3-${u}@test.example.com`),
          async (existingEmail) => {
            const nonexistentEmail = `prop3-nonexistent-${randomUUID()}@test.example.com`;
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop3-test-password");

            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${existingEmail}, ${passwordHash}, 'Prop3 Reader', 0, 'reader')
            `;

            try {
              // Scenario 1: Email exists (not rate-limited)
              const formDataExists = new FormData();
              formDataExists.set("email", existingEmail);
              const responseExists = await requestPasswordResetAction(
                null,
                formDataExists
              );

              // Scenario 2: Email does not exist
              const formDataNotExists = new FormData();
              formDataNotExists.set("email", nonexistentEmail);
              const responseNotExists = await requestPasswordResetAction(
                null,
                formDataNotExists
              );

              // Scenario 3: Rate-limited — create 3 tokens to exceed email limit
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < 3; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetToken(
                  readerId,
                  tokenHash,
                  expiresAt,
                  "192.168.1.100"
                );
              }
              const formDataRateLimited = new FormData();
              formDataRateLimited.set("email", existingEmail);
              const responseRateLimited = await requestPasswordResetAction(
                null,
                formDataRateLimited
              );

              // All three scenarios must return identical user-facing response
              expect(responseExists).toEqual({
                message: GENERIC_SUCCESS_MESSAGE,
                success: true,
              });
              expect(responseNotExists).toEqual({
                message: GENERIC_SUCCESS_MESSAGE,
                success: true,
              });
              expect(responseRateLimited).toEqual({
                message: GENERIC_SUCCESS_MESSAGE,
                success: true,
              });
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

/**
 * Property 4: Token generation meets minimum entropy
 * Validates: Requirements 2.1, 2.2 (Email Password Reset)
 *
 * For any call to generateResetToken(), the token SHALL have sufficient entropy
 * to resist brute-force guessing. This property verifies:
 * - Token length meets minimum (32 bytes → 43 base64url chars)
 * - Token uses valid base64url character set (URL-safe)
 * - Tokens are pairwise distinct across many generations (no collisions)
 *
 * Property 5: Token storage round-trip
 * Validates: Requirements 2.3, 2.6 (Email Password Reset)
 *
 * For any token, hashing and "storing" the hash, then verifying with the
 * original token SHALL succeed. Verifying with a different token SHALL fail.
 * The hash SHALL be deterministic (same token → same hash).
 *
 * Property 6: Token expiration
 * Validates: Requirements 2.4 (Email Password Reset)
 *
 * For any reset token, validating it after 1 hour from its creation time
 * SHALL return an invalid/expired result. Validating it before 1 hour
 * SHALL return a valid result (assuming not used or invalidated).
 *
 * Property 10: Token validation correctness
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4 (Email Password Reset)
 *
 * For any token string, the validation function SHALL return valid: true only
 * when the token exists in the database, has not expired, and has not been used.
 * All other cases (non-existent, expired, used) SHALL return valid: false.
 *
 * Property 14: Email rate limiting
 * Validates: Requirements 6.1 (Email Password Reset)
 *
 * For any email address, after 3 reset requests within a 1-hour window,
 * subsequent requests SHALL be rate-limited (allowed: false).
 *
 * Property 15: IP rate limiting
 * Validates: Requirements 6.2 (Email Password Reset)
 *
 * For any IP address, after 10 reset requests within a 1-hour window,
 * subsequent requests SHALL be rate-limited regardless of the email used.
 *
 * Property 8: Email contains reset link with token
 * Validates: Requirements 3.1, 3.2 (Email Password Reset)
 *
 * For any generated reset email, the email body SHALL contain a URL that
 * includes the raw token as a query parameter and points to /auth/reset-password.
 *
 * Property 17: No sensitive data in logs
 * Validates: Requirements 7.4 (Email Password Reset)
 *
 * For any log entry in the password_reset_log table, the entry SHALL NOT
 * contain plaintext email addresses, raw tokens, or passwords in any field.
 * Sanitization strips these patterns before logging.
 */

import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from "vitest";
import * as fc from "fast-check";
import { resetPasswordAction } from "@/app/actions/password-reset";
import {
  generateResetToken,
  hashToken,
  validateResetToken,
  validatePasswordForReset,
  MIN_PASSWORD_LENGTH,
  checkRateLimit,
} from "@/lib/auth/password-reset";
import {
  sanitizeForSecurityLog,
  containsSensitiveData,
} from "@/lib/auth/log-sanitization";
import { sendResetEmail, isResendConfigured } from "@/lib/auth/resend";
import {
  createPasswordResetToken,
  getReaderByEmailWithPassword,
  logPasswordResetEvent,
  markResetTokenUsed,
  sql,
  updateReaderPassword,
} from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { randomUUID } from "node:crypto";

// Property 8: mock Resend to capture email HTML without sending
const mockResendSend = vi.hoisted(() => vi.fn());
vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: mockResendSend };
  },
}));

const hasPostgres =
  typeof process.env.POSTGRES_URL === "string" &&
  process.env.POSTGRES_URL.length > 0;

// Property 6 uses mocked getResetTokenByHash; Property 10 uses real DB.
// Mock delegates to real when no implementation is set.
const { mockGetResetTokenByHash } = vi.hoisted(() => ({
  mockGetResetTokenByHash: vi.fn(),
}));
vi.mock("@/lib/db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/db")>();
  return {
    ...actual,
    getResetTokenByHash: (tokenHash: string) => {
      if (mockGetResetTokenByHash.getMockImplementation()) {
        return mockGetResetTokenByHash(tokenHash);
      }
      return actual.getResetTokenByHash(tokenHash);
    },
  };
});

/** Base64url encodes 32 bytes to 43 characters (ceil(256/6)). */
const MIN_TOKEN_LENGTH = 43;

/** Valid base64url characters: A-Za-z0-9_- */
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

describe("Property 4: Token generation meets minimum entropy", () => {
  it("token has minimum length for 256-bit entropy", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 100 }), (n) => {
        const tokens: string[] = [];
        for (let i = 0; i < n; i++) {
          const { token } = generateResetToken();
          expect(token.length).toBeGreaterThanOrEqual(MIN_TOKEN_LENGTH);
          tokens.push(token);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("token uses valid base64url character set (URL-safe)", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        for (let i = 0; i < n; i++) {
          const { token } = generateResetToken();
          expect(token).toMatch(BASE64URL_PATTERN);
          expect(token).not.toContain("+");
          expect(token).not.toContain("/");
          expect(token).not.toContain("=");
        }
      }),
      { numRuns: 100 }
    );
  });

  it("generated tokens are pairwise distinct (no collisions)", () => {
    const NUM_TOKENS = 100;
    const tokens = new Set<string>();
    const hashes = new Set<string>();

    for (let i = 0; i < NUM_TOKENS; i++) {
      const { token, tokenHash } = generateResetToken();
      expect(tokens.has(token)).toBe(false);
      expect(hashes.has(tokenHash)).toBe(false);
      tokens.add(token);
      hashes.add(tokenHash);
    }
  });

  it("token length is exactly 43 for 32-byte input (base64url)", () => {
    for (let i = 0; i < 20; i++) {
      const { token } = generateResetToken();
      expect(token.length).toBe(MIN_TOKEN_LENGTH);
    }
  });
});

/** Generator for token-like strings used in Property 5. */
const tokenLikeString = fc.string({ minLength: 1, maxLength: 128 });

describe("Property 5: Token storage round-trip", () => {
  it("stored hash verifies when submitted token matches original", () => {
    fc.assert(
      fc.property(tokenLikeString, (token) => {
        const storedHash = hashToken(token);
        const submittedToken = token;
        const verifyHash = hashToken(submittedToken);
        expect(verifyHash).toBe(storedHash);
      }),
      { numRuns: 100 }
    );
  });

  it("stored hash rejects when submitted token differs", () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(tokenLikeString, { minLength: 2, maxLength: 2 }),
        ([token, other]) => {
          const storedHash = hashToken(token);
          const verifyHash = hashToken(other);
          expect(verifyHash).not.toBe(storedHash);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("hash is deterministic — same token always produces same hash", () => {
    fc.assert(
      fc.property(tokenLikeString, (token) => {
        expect(hashToken(token)).toBe(hashToken(token));
      }),
      { numRuns: 100 }
    );
  });

  it("generateResetToken round-trip: tokenHash verifies against token", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        for (let i = 0; i < n; i++) {
          const { token, tokenHash } = generateResetToken();
          expect(hashToken(token)).toBe(tokenHash);
        }
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 12: Password validation rules
 * Validates: Requirements 5.2, 5.3 (Email Password Reset)
 *
 * For any password string shorter than 8 characters, the reset form SHALL reject it.
 * For any pair of non-matching password and confirmation strings, the reset form SHALL reject them.
 */
describe("Property 12: Password validation rules", () => {
  it("Feature: password-recovery-resend, Property 12: Password validation rules — any password shorter than 8 characters is rejected", () => {
    const shortPassword = fc.string({ minLength: 0, maxLength: MIN_PASSWORD_LENGTH - 1 });
    fc.assert(
      fc.property(shortPassword, fc.string(), (password, confirmPassword) => {
        const result = validatePasswordForReset(password, confirmPassword);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Password must be at least 8 characters.");
      }),
      { numRuns: 100 }
    );
  });

  it("Feature: password-recovery-resend, Property 12: Password validation rules — any pair of non-matching password and confirmation is rejected", () => {
    const nonMatchingPair = fc
      .tuple(
        fc.string({ minLength: MIN_PASSWORD_LENGTH, maxLength: 128 }),
        fc.string({ minLength: MIN_PASSWORD_LENGTH, maxLength: 128 })
      )
      .filter(([a, b]) => a !== b);
    fc.assert(
      fc.property(nonMatchingPair, ([password, confirmPassword]) => {
        const result = validatePasswordForReset(password, confirmPassword);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Passwords do not match.");
      }),
      { numRuns: 100 }
    );
  });

  it("for any password 8+ chars with matching confirmation, validation passes", () => {
    const validPassword = fc.string({ minLength: MIN_PASSWORD_LENGTH, maxLength: 128 });
    fc.assert(
      fc.property(validPassword, (password) => {
        const result = validatePasswordForReset(password, password);
        expect(result.valid).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 13: Password reset round-trip
 * Validates: Requirements 5.4, 5.5 (Email Password Reset)
 *
 * For any valid reset token and valid new password, after completing the reset:
 * (a) verifying the new password against the stored hash should return true,
 * (b) verifying the old password should return false,
 * and (c) the used token should fail validation.
 */
describe("Property 13: Password reset round-trip", () => {
  const validPasswordArb = fc
    .string({ minLength: MIN_PASSWORD_LENGTH, maxLength: 128 })
    .filter((s) => /[\x20-\x7e]/.test(s)); // printable ASCII to avoid encoding issues

  it.skipIf(!hasPostgres)(
    "Feature: password-recovery-resend, Property 13: Password reset round-trip — after reset, new password verifies, old password fails, token is invalid",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            oldPassword: validPasswordArb,
            newPassword: validPasswordArb,
            email: fc.uuid().map((u) => `prop13-${u}@test.example.com`),
          }).filter(({ oldPassword, newPassword }) => oldPassword !== newPassword),
          async ({ oldPassword, newPassword, email }) => {
            const readerId = randomUUID();
            const oldPasswordHash = await hashPassword(oldPassword);

            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${oldPasswordHash}, 'Prop13 Reader', 0, 'reader')
            `;

            try {
              const { token, tokenHash } = generateResetToken();
              const expiresAt = new Date(Date.now() + 3600000);
              await createPasswordResetToken(readerId, tokenHash, expiresAt);

              // Perform the reset: update password and mark token used (Req 5.4, 5.5)
              const newPasswordHash = await hashPassword(newPassword);
              await updateReaderPassword(readerId, newPasswordHash);
              await markResetTokenUsed(tokenHash);

              // (a) New password verifies against stored hash
              const reader = await getReaderByEmailWithPassword(email);
              expect(reader).not.toBeNull();
              const newPasswordValid = await verifyPassword(newPassword, reader!.password_hash);
              expect(newPasswordValid).toBe(true);

              // (b) Old password should return false
              const oldPasswordValid = await verifyPassword(oldPassword, reader!.password_hash);
              expect(oldPasswordValid).toBe(false);

              // (c) Used token should fail validation
              const tokenValidation = await validateResetToken(token);
              expect(tokenValidation.valid).toBe(false);
              expect(tokenValidation.error).toBe("used");
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

/**
 * Property 7: Token invalidation on re-request
 * Validates: Requirements 2.5 (Email Password Reset)
 *
 * For any reader with an existing valid reset token, requesting a new token
 * SHALL cause the previous token to fail validation.
 */
describe("Property 7: Token invalidation on re-request", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RESEND_API_KEY = "";
    process.env.RESEND_FROM_EMAIL = "";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.skipIf(!hasPostgres)(
    "Feature: password-recovery-resend, Property 7: Token invalidation on re-request — requesting new token invalidates previous token",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid().map((u) => `prop7-${u}@test.example.com`),
          async (email) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop7-test-password");

            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop7 Reader', 0, 'reader')
            `;

            try {
              // Create initial valid token for reader
              const { token: oldToken, tokenHash: oldTokenHash } =
                generateResetToken();
              const expiresAt = new Date(Date.now() + 3600000);
              await createPasswordResetToken(readerId, oldTokenHash, expiresAt);

              // Verify old token is valid before re-request
              const beforeValidation = await validateResetToken(oldToken);
              expect(beforeValidation.valid).toBe(true);
              expect(beforeValidation.readerId).toBe(readerId);

              // Request new token (invalidates previous via requestPasswordResetAction)
              const formData = new FormData();
              formData.set("email", email);
              await requestPasswordResetAction(null, formData);

              // Previous token must now fail validation (Req 2.5)
              const afterValidation = await validateResetToken(oldToken);
              expect(afterValidation.valid).toBe(false);
              expect(afterValidation.error).toBe("invalid");
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM password_reset_log WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

/** Property 8: Email contains reset link with token — Validates: Requirements 3.1, 3.2 */
describe("Property 8: Email contains reset link with token", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    mockResendSend.mockReset();
    mockResendSend.mockResolvedValue({ data: { id: "msg_prop8" }, error: null });
    process.env.RESEND_API_KEY = "re_prop8_test";
    process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("for any base URL and token, email HTML contains reset URL with token and /auth/reset-password path", async () => {
    const baseUrlArb = fc.oneof(
      fc.constant("https://app.example.com"),
      fc.constant("https://localhost:3000"),
      fc.constant("https://midnightsatin.com"),
      fc.constant("https://staging.example.com"),
      fc.tuple(fc.constantFrom("https://", "http://"), fc.domain()).map(
        ([scheme, host]) => `${scheme}${host}`
      )
    );

    await fc.assert(
      fc.asyncProperty(
        baseUrlArb,
        fc.integer({ min: 1, max: 50 }),
        async (baseUrl, _n) => {
          const { token } = generateResetToken();
          const resetUrl = `${baseUrl.replace(/\/$/, "")}/auth/reset-password?token=${token}`;

          await sendResetEmail({
            to: "reader@example.com",
            resetUrl,
            expiresInMinutes: 60,
          });

          expect(mockResendSend).toHaveBeenCalled();
          const lastCall = mockResendSend.mock.calls.at(-1);
          const html = lastCall?.[0]?.html;
          expect(html).toBeDefined();
          expect(typeof html).toBe("string");

          // Email body contains the full reset URL (Req 3.2)
          expect(html).toContain(resetUrl);

          // URL points to /auth/reset-password path
          expect(html).toContain("/auth/reset-password");

          // URL includes the raw token as query parameter
          expect(html).toContain(token);
        }
      ),
      { numRuns: 100 }
    );
  });
});

/**
 * Property 9: Email failure does not change user response
 * Validates: Requirements 3.6 (Email Password Reset)
 *
 * For any reset request where the Resend service fails, the user-facing response
 * SHALL be identical to a successful request, and an error SHALL be logged.
 */
describe("Property 9: Email failure does not change user response", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RESEND_API_KEY = "re_prop9_test";
    process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
    mockResendSend.mockReset();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it.skipIf(!hasPostgres)(
    "Feature: password-recovery-resend, Property 9: Email failure does not change user response — Resend success and failure return identical message; failure logs email_failed",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid().map((u) => `prop9-${u}@test.example.com`),
          async (email) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop9-test-password");

            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop9 Reader', 0, 'reader')
            `;

            try {
              const formData = new FormData();
              formData.set("email", email);

              // Scenario A: Resend succeeds
              mockResendSend.mockResolvedValue({ data: { id: "msg_ok" }, error: null });
              const responseSuccess = await requestPasswordResetAction(null, formData);

              // Scenario B: Resend fails
              mockResendSend.mockResolvedValue({ data: null, error: { message: "Resend API error" } });
              const responseFailure = await requestPasswordResetAction(null, formData);

              // Both must return identical user-facing response (Req 3.6)
              expect(responseSuccess).toEqual({
                message: GENERIC_SUCCESS_MESSAGE,
                success: true,
              });
              expect(responseFailure).toEqual({
                message: GENERIC_SUCCESS_MESSAGE,
                success: true,
              });

              // When Resend fails, email_failed must be logged
              const { rows } = await sql<{ event_type: string }>`
                SELECT event_type FROM password_reset_log
                WHERE reader_id = ${readerId} AND event_type = 'email_failed'
                ORDER BY created_at DESC LIMIT 1
              `;
              expect(rows.length).toBeGreaterThanOrEqual(1);
              expect(rows[0].event_type).toBe("email_failed");
            } finally {
              await sql`DELETE FROM password_reset_log WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

/**
 * Property 18: Missing environment variables disable feature
 * Validates: Requirements 8.3 (Email Password Reset)
 *
 * For any configuration state where RESEND_API_KEY or RESEND_FROM_EMAIL is
 * missing or empty, isResendConfigured() SHALL return false. When both are
 * set and non-empty (after trim), isResendConfigured() SHALL return true.
 */
describe("Property 18: Missing environment variables disable feature", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env.RESEND_API_KEY = originalEnv.RESEND_API_KEY;
    process.env.RESEND_FROM_EMAIL = originalEnv.RESEND_FROM_EMAIL;
  });

  it("Feature: password-recovery-resend, Property 18: Missing env vars — isResendConfigured returns false when either var is missing, empty, or whitespace", () => {
    const emptyOrWhitespace = fc.oneof(
      fc.constant(""),
      fc.integer({ min: 1, max: 20 }).map((n) => " ".repeat(n))
    );
    const nonEmptyString = fc
      .string({ minLength: 1, maxLength: 64 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        fc.oneof(
          fc.record({
            apiKey: emptyOrWhitespace,
            fromEmail: nonEmptyString,
          }),
          fc.record({
            apiKey: nonEmptyString,
            fromEmail: emptyOrWhitespace,
          }),
          fc.record({
            apiKey: emptyOrWhitespace,
            fromEmail: emptyOrWhitespace,
          })
        ),
        (env) => {
          process.env.RESEND_API_KEY = env.apiKey;
          process.env.RESEND_FROM_EMAIL = env.fromEmail;
          expect(isResendConfigured()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Feature: password-recovery-resend, Property 18: Missing env vars — isResendConfigured returns false when RESEND_API_KEY is undefined", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        delete process.env.RESEND_API_KEY;
        process.env.RESEND_FROM_EMAIL = `test${n}@midnightsatin.com`;
        expect(isResendConfigured()).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("Feature: password-recovery-resend, Property 18: Missing env vars — isResendConfigured returns false when RESEND_FROM_EMAIL is undefined", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 50 }), (n) => {
        process.env.RESEND_API_KEY = `re_test_${n}`;
        delete process.env.RESEND_FROM_EMAIL;
        expect(isResendConfigured()).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("Feature: password-recovery-resend, Property 18: Missing env vars — isResendConfigured returns true when both vars are non-empty", () => {
    const nonEmptyString = fc
      .string({ minLength: 1, maxLength: 64 })
      .filter((s) => s.trim().length > 0);

    fc.assert(
      fc.property(
        fc.record({
          apiKey: nonEmptyString,
          fromEmail: nonEmptyString,
        }),
        (env) => {
          process.env.RESEND_API_KEY = env.apiKey;
          process.env.RESEND_FROM_EMAIL = env.fromEmail;
          expect(isResendConfigured()).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("Feature: password-recovery-resend, Property 18: Missing env vars — sendResetEmail returns error without sending when not configured", async () => {
    mockResendSend.mockClear();
    process.env.RESEND_API_KEY = "";
    process.env.RESEND_FROM_EMAIL = "";

    const result = await sendResetEmail({
      to: "reader@example.com",
      resetUrl: "https://app.example.com/auth/reset-password?token=abc",
      expiresInMinutes: 60,
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain("RESEND_API_KEY");
    expect(result.error).toContain("RESEND_FROM_EMAIL");
    expect(mockResendSend).not.toHaveBeenCalled();
  });
});

/** One hour in milliseconds (Req 2.4). */
const ONE_HOUR_MS = 60 * 60 * 1000;

describe("Property 6: Token expiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    mockGetResetTokenByHash.mockReset();
  });

  it("token valid before 1 hour, expired after 1 hour", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 1000 }), // creation time offset (days ago)
        fc.integer({ min: -5, max: 125 }), // minutes from creation
        async (daysAgo, offsetMinutes) => {
          const creationTime =
            Date.now() - daysAgo * 24 * 60 * 60 * 1000;
          const expiresAt = new Date(creationTime + ONE_HOUR_MS);
          const now = new Date(
            creationTime + offsetMinutes * 60 * 1000
          );

          vi.setSystemTime(now);
          mockGetResetTokenByHash.mockResolvedValue({
            readerId: "reader-1",
            expiresAt,
            usedAt: null,
          });

          const result = await validateResetToken("any-token");

          if (offsetMinutes > 60) {
            expect(result.valid).toBe(false);
            expect(result.error).toBe("expired");
          } else {
            expect(result.valid).toBe(true);
            expect(result.readerId).toBe("reader-1");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 10: Token validation correctness", () => {
  let readerId: string | undefined;

  beforeAll(async () => {
    if (!hasPostgres) return;
    readerId = randomUUID();
    const email = `prop10-${readerId}@test.example.com`;
    const passwordHash = await hashPassword("prop10-test-password");
    await sql`
      INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
      VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop10 Reader', 0, 'reader')
    `;
  });

  afterEach(async () => {
    if (!hasPostgres || !readerId) return;
    await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
  });

  afterAll(async () => {
    if (!hasPostgres || !readerId) return;
    await sql`DELETE FROM readers WHERE id = ${readerId}`;
  });

  it.skipIf(!hasPostgres)(
    "non-existent token returns valid: false, error: invalid",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 128 }),
          async (token) => {
            const result = await validateResetToken(token);
            expect(result.valid).toBe(false);
            expect(result.error).toBe("invalid");
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "valid token (exists, not expired, not used) returns valid: true with readerId",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
          const { token, tokenHash } = generateResetToken();
          const expiresAt = new Date(Date.now() + 3600000);
          await createPasswordResetToken(readerId!, tokenHash, expiresAt);
          const result = await validateResetToken(token);
          expect(result.valid).toBe(true);
          expect(result.readerId).toBe(readerId);
          expect(result.error).toBeUndefined();
        }),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "expired token returns valid: false, error: expired",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
          const { token, tokenHash } = generateResetToken();
          const expiresAt = new Date(Date.now() - 1000);
          await createPasswordResetToken(readerId!, tokenHash, expiresAt);
          const result = await validateResetToken(token);
          expect(result.valid).toBe(false);
          expect(result.error).toBe("expired");
        }),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "used token returns valid: false, error: used",
    async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ min: 1, max: 50 }), async (n) => {
          const { token, tokenHash } = generateResetToken();
          const expiresAt = new Date(Date.now() + 3600000);
          await createPasswordResetToken(readerId!, tokenHash, expiresAt);
          await markResetTokenUsed(tokenHash);
          const result = await validateResetToken(token);
          expect(result.valid).toBe(false);
          expect(result.error).toBe("used");
        }),
        { numRuns: 100 }
      );
    }
  );
});

/**
 * Property 11: Token error message uniformity
 * Validates: Requirements 4.5 (Email Password Reset)
 *
 * For any invalid token (whether non-existent, expired, or already used),
 * the error message displayed to the user SHALL be identical across all
 * three cases. Prevents information disclosure about token state.
 */
describe("Property 11: Token error message uniformity", () => {
  const validPassword = "prop11-valid-password-min8";

  it.skipIf(!hasPostgres)(
    "Feature: password-recovery-resend, Property 11: Token error message uniformity — invalid, expired, and used tokens all return identical user-facing message",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid().map((u) => `prop11-${u}@test.example.com`),
          async (email) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop11-test-password");

            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop11 Reader', 0, 'reader')
            `;

            try {
              const mkForm = (token: string) => {
                const fd = new FormData();
                fd.set("token", token);
                fd.set("password", validPassword);
                fd.set("confirmPassword", validPassword);
                return fd;
              };

              // Scenario 1: Invalid (non-existent) token
              const invalidToken = `invalid-${randomUUID().replace(/-/g, "")}`;
              const responseInvalid = await resetPasswordAction(
                null,
                mkForm(invalidToken)
              );

              // Scenario 2: Expired token
              const { token: expiredToken, tokenHash: expiredHash } =
                generateResetToken();
              const expiresAt = new Date(Date.now() - 1000);
              await createPasswordResetToken(readerId, expiredHash, expiresAt);
              const responseExpired = await resetPasswordAction(
                null,
                mkForm(expiredToken)
              );

              // Scenario 3: Used token
              const { token: usedToken, tokenHash: usedHash } =
                generateResetToken();
              const usedExpiresAt = new Date(Date.now() + 3600000);
              await createPasswordResetToken(readerId, usedHash, usedExpiresAt);
              await markResetTokenUsed(usedHash);
              const responseUsed = await resetPasswordAction(
                null,
                mkForm(usedToken)
              );

              // All three must return identical user-facing error (Req 4.5)
              expect(responseInvalid).toEqual({ error: INVALID_TOKEN_MESSAGE });
              expect(responseExpired).toEqual({ error: INVALID_TOKEN_MESSAGE });
              expect(responseUsed).toEqual({ error: INVALID_TOKEN_MESSAGE });
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM password_reset_log WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

/** Helper: insert token with ip_address for IP rate limit tests. */
async function createPasswordResetTokenWithIp(
  readerId: string,
  tokenHash: string,
  expiresAt: Date,
  ipAddress: string
): Promise<void> {
  await sql`
    INSERT INTO password_reset_tokens (reader_id, token_hash, expires_at, ip_address)
    VALUES (${readerId}, ${tokenHash}, ${expiresAt.toISOString()}, ${ipAddress})
  `;
}

describe("Property 14: Email rate limiting", () => {
  it.skipIf(!hasPostgres)(
    "after 3 reset requests for same email, checkRateLimit returns allowed: false",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid().map((u) => `prop14-${u}@test.example.com`),
          async (email) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop14-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop14 Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < 3; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetToken(readerId, tokenHash, expiresAt);
              }
              const result = await checkRateLimit(email, "192.168.1.1");
              expect(result.allowed).toBe(false);
              expect(result.retryAfterSeconds).toBe(3600);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "with 0, 1, or 2 requests for same email, checkRateLimit returns allowed: true",
    async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.uuid().map((u) => `prop14b-${u}@test.example.com`),
            count: fc.integer({ min: 0, max: 2 }),
          }),
          async ({ email, count }) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop14b-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop14b Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < count; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetToken(readerId, tokenHash, expiresAt);
              }
              const result = await checkRateLimit(email, "10.0.0.1");
              expect(result.allowed).toBe(true);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

describe("Property 15: IP rate limiting", () => {
  it.skipIf(!hasPostgres)(
    "after 10 reset requests from same IP, checkRateLimit returns allowed: false",
    async () => {
      const ipArb = fc
        .tuple(
          fc.integer(1, 254),
          fc.integer(0, 255),
          fc.integer(0, 255),
          fc.integer(1, 254)
        )
        .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.uuid().map((u) => `prop15-${u}@test.example.com`),
            ip: ipArb,
          }),
          async ({ email, ip }) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop15-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop15 Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < 10; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetTokenWithIp(
                  readerId,
                  tokenHash,
                  expiresAt,
                  ip
                );
              }
              const result = await checkRateLimit(email, ip);
              expect(result.allowed).toBe(false);
              expect(result.retryAfterSeconds).toBe(3600);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );

  it.skipIf(!hasPostgres)(
    "with 0 to 9 requests from same IP, checkRateLimit returns allowed: true",
    async () => {
      const ipArb = fc
        .tuple(
          fc.integer(1, 254),
          fc.integer(0, 255),
          fc.integer(0, 255),
          fc.integer(1, 254)
        )
        .map(([a, b, c, d]) => `${a}.${b}.${c}.${d}`);
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            email: fc.uuid().map((u) => `prop15b-${u}@test.example.com`),
            ip: ipArb,
            count: fc.integer({ min: 0, max: 9 }),
          }),
          async ({ email, ip, count }) => {
            const readerId = randomUUID();
            const passwordHash = await hashPassword("prop15b-password");
            await sql`
              INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
              VALUES (${readerId}, ${email}, ${passwordHash}, 'Prop15b Reader', 0, 'reader')
            `;
            try {
              const expiresAt = new Date(Date.now() + 3600000);
              for (let i = 0; i < count; i++) {
                const { tokenHash } = generateResetToken();
                await createPasswordResetTokenWithIp(
                  readerId,
                  tokenHash,
                  expiresAt,
                  ip
                );
              }
              const result = await checkRateLimit(email, ip);
              expect(result.allowed).toBe(true);
            } finally {
              await sql`DELETE FROM password_reset_tokens WHERE reader_id = ${readerId}`;
              await sql`DELETE FROM readers WHERE id = ${readerId}`;
            }
          }
        ),
        { numRuns: 100 }
      );
    }
  );
});

/** Property 17: No sensitive data in logs — Validates: Requirements 7.4 */
describe("Property 17: No sensitive data in logs", () => {
  it("sanitized output contains no email pattern (@) for any input string", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const sanitized = sanitizeForSecurityLog(s);
        if (sanitized === null) return true;
        expect(sanitized).not.toMatch(/@/);
      }),
      { numRuns: 100 }
    );
  });

  it("sanitized output contains no token-like substring (40+ base64url chars) for any input", () => {
    fc.assert(
      fc.property(fc.string(), (s) => {
        const sanitized = sanitizeForSecurityLog(s);
        if (sanitized === null) return true;
        expect(sanitized).not.toMatch(/[A-Za-z0-9_-]{40,}/);
      }),
      { numRuns: 100 }
    );
  });

  it("for any email address, sanitizeForSecurityLog strips it", () => {
    fc.assert(
      fc.property(fc.emailAddress(), (email) => {
        const sanitized = sanitizeForSecurityLog(email);
        expect(sanitized).not.toBeNull();
        expect(containsSensitiveData(sanitized!)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("for any token-like string (40+ base64url chars), sanitizeForSecurityLog strips it", () => {
    const base64urlChar = fc.constantFrom(
      ..."ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-"
    );
    const tokenLike = fc
      .array(base64urlChar, { minLength: 40, maxLength: 64 })
      .map((arr) => `prefix-${arr.join("")}-suffix`);
    fc.assert(
      fc.property(tokenLike, (s) => {
        const sanitized = sanitizeForSecurityLog(s);
        expect(sanitized).not.toBeNull();
        expect(containsSensitiveData(sanitized!)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  it("null and undefined return null", () => {
    expect(sanitizeForSecurityLog(null)).toBeNull();
    expect(sanitizeForSecurityLog(undefined)).toBeNull();
  });

  it("safe strings (IPs, reason codes) pass through unchanged", () => {
    const safeStrings = fc.constantFrom(
      "192.168.1.1",
      "10.0.0.1",
      "invalid",
      "expired",
      "used",
      "rate_limited"
    );
    fc.assert(
      fc.property(safeStrings, (s) => {
        const sanitized = sanitizeForSecurityLog(s);
        expect(sanitized).toBe(s);
      }),
      { numRuns: 100 }
    );
  });
});

/** logPasswordResetEvent - Requirements: 7.1, 7.2, 7.3, 7.4 */
describe("logPasswordResetEvent", () => {
  const testReaderId = randomUUID();

  beforeAll(async () => {
    if (!hasPostgres) return;
    const passwordHash = await hashPassword("test-password-123");
    await sql`
      INSERT INTO readers (id, email, password_hash, display_name, credit_balance, role)
      VALUES (${testReaderId}, 'log-test@example.com', ${passwordHash}, 'Log Test', 0, 'reader')
    `;
  });

  afterEach(async () => {
    if (!hasPostgres) return;
    await sql`DELETE FROM password_reset_log WHERE reader_id = ${testReaderId}`;
    await sql`DELETE FROM password_reset_log WHERE reader_id IS NULL`;
  });

  afterAll(async () => {
    if (!hasPostgres) return;
    await sql`DELETE FROM password_reset_log WHERE reader_id = ${testReaderId}`;
    await sql`DELETE FROM readers WHERE id = ${testReaderId}`;
  });

  it.skipIf(!hasPostgres)(
    "inserts event into password_reset_log with event_type, reader_id, ip_address, reason_code",
    async () => {
      await logPasswordResetEvent("token_generated", {
        readerId: testReaderId,
        ipAddress: "192.168.1.100",
        reasonCode: null,
      });

      const { rows } = await sql<{
        event_type: string;
        reader_id: string | null;
        ip_address: string | null;
        reason_code: string | null;
      }>`
        SELECT event_type, reader_id, ip_address, reason_code
        FROM password_reset_log
        WHERE reader_id = ${testReaderId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      expect(rows).toHaveLength(1);
      expect(rows[0].event_type).toBe("token_generated");
      expect(rows[0].reader_id).toBe(testReaderId);
      expect(rows[0].ip_address).toBe("192.168.1.100");
    }
  );

  it.skipIf(!hasPostgres)(
    "accepts optional params; nulls are stored when omitted",
    async () => {
      await logPasswordResetEvent("link_expired");

      const { rows } = await sql<{
        event_type: string;
        reader_id: string | null;
        ip_address: string | null;
        reason_code: string | null;
      }>`
        SELECT event_type, reader_id, ip_address, reason_code
        FROM password_reset_log
        WHERE reader_id IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `;

      expect(rows).toHaveLength(1);
      expect(rows[0].event_type).toBe("link_expired");
      expect(rows[0].reader_id).toBeNull();
      expect(rows[0].ip_address).toBeNull();
      expect(rows[0].reason_code).toBeNull();
    }
  );

  it.skipIf(!hasPostgres)(
    "does not log sensitive data: no email, token, or password in any column (Req 7.4)",
    async () => {
      await logPasswordResetEvent("password_changed", {
        readerId: testReaderId,
        ipAddress: "10.0.0.1",
      });

      const { rows } = await sql<Record<string, string | null>>`
        SELECT event_type, reader_id, ip_address, reason_code
        FROM password_reset_log
        WHERE reader_id = ${testReaderId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      expect(rows).toHaveLength(1);
      const row = rows[0];
      const allValues = Object.values(row).filter(Boolean).join(" ");

      // Sensitive patterns that must NOT appear in logs (Req 7.4)
      expect(allValues).not.toMatch(/@/); // no email addresses
      expect(allValues).not.toMatch(/[A-Za-z0-9_-]{40,}/); // no raw tokens (base64url)
    }
  );

  it.skipIf(!hasPostgres)(
    "sanitizes ip_address when sensitive data is passed (Property 17, Req 7.4)",
    async () => {
      await logPasswordResetEvent("rate_limited", {
        readerId: testReaderId,
        ipAddress: "attacker@evil.com",
      });

      const { rows } = await sql<{ ip_address: string | null }>`
        SELECT ip_address
        FROM password_reset_log
        WHERE reader_id = ${testReaderId}
        ORDER BY created_at DESC
        LIMIT 1
      `;

      expect(rows).toHaveLength(1);
      expect(rows[0].ip_address).toBe("[REDACTED]");
    }
  );
});
