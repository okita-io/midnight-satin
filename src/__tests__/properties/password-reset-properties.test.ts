/**
 * Property 4: Token generation meets minimum entropy
 * Validates: Requirements 2.1, 2.2 (Email Password Reset)
 *
 * For any call to generateResetToken(), the token SHALL have sufficient entropy
 * to resist brute-force guessing. This property verifies:
 * - Token length meets minimum (32 bytes → 43 base64url chars)
 * - Token uses valid base64url character set (URL-safe)
 * - Tokens are pairwise distinct across many generations (no collisions)
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generateResetToken } from "@/lib/auth/password-reset";

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
