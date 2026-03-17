/**
 * Unit tests for password reset token generation and hashing.
 * Requirements: 2.1, 2.2, 2.6
 */

import { describe, it, expect } from "vitest";
import {
  generateResetToken,
  hashToken,
  type ResetTokenResult,
} from "@/lib/auth/password-reset";

describe("password-reset", () => {
  describe("generateResetToken", () => {
    it("returns ResetTokenResult with token and tokenHash", () => {
      const result = generateResetToken();
      expect(result).toHaveProperty("token");
      expect(result).toHaveProperty("tokenHash");
      expect(typeof result.token).toBe("string");
      expect(typeof result.tokenHash).toBe("string");
    });

    it("token is base64url encoded (URL-safe, no padding)", () => {
      const { token } = generateResetToken();
      expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
      expect(token).not.toContain("+");
      expect(token).not.toContain("/");
      expect(token).not.toContain("=");
    });

    it("tokenHash equals hashToken(token)", () => {
      const { token, tokenHash } = generateResetToken();
      expect(hashToken(token)).toBe(tokenHash);
    });

    it("generates unique tokens per call", () => {
      const a = generateResetToken();
      const b = generateResetToken();
      expect(a.token).not.toBe(b.token);
      expect(a.tokenHash).not.toBe(b.tokenHash);
    });
  });

  describe("hashToken", () => {
    it("returns deterministic SHA-256 hex for same input", () => {
      const token = "test-token-123";
      expect(hashToken(token)).toBe(hashToken(token));
    });

    it("returns 64-character hex string", () => {
      const hash = hashToken("any-token");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("different tokens produce different hashes", () => {
      expect(hashToken("token-a")).not.toBe(hashToken("token-b"));
    });
  });

  describe("ResetTokenResult", () => {
    it("is exported and usable", () => {
      const result: ResetTokenResult = generateResetToken();
      expect(result).toBeDefined();
    });
  });
});
