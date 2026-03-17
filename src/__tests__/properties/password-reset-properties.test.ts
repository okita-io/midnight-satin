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
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import * as fc from "fast-check";
import {
  generateResetToken,
  hashToken,
  validateResetToken,
} from "@/lib/auth/password-reset";

vi.mock("@/lib/db", () => ({
  getResetTokenByHash: vi.fn(),
}));

import { getResetTokenByHash } from "@/lib/db";

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

/** One hour in milliseconds (Req 2.4). */
const ONE_HOUR_MS = 60 * 60 * 1000;

describe("Property 6: Token expiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.mocked(getResetTokenByHash).mockReset();
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
          vi.mocked(getResetTokenByHash).mockResolvedValue({
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
