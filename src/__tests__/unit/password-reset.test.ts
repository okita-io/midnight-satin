/**
 * Unit tests for password reset token generation, hashing, validation, and rate limiting.
 * Requirements: 2.1, 2.2, 2.6, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateResetToken,
  hashToken,
  validateResetToken,
  checkRateLimit,
  type ResetTokenResult,
  type TokenValidationResult,
} from "@/lib/auth/password-reset";

const mockCountRecentResetRequests = vi.fn();
const mockCountRecentResetRequestsByIp = vi.fn();

vi.mock("@/lib/db", () => ({
  getResetTokenByHash: vi.fn(),
  countRecentResetRequests: (...args: unknown[]) =>
    mockCountRecentResetRequests(...args),
  countRecentResetRequestsByIp: (...args: unknown[]) =>
    mockCountRecentResetRequestsByIp(...args),
}));

import { getResetTokenByHash } from "@/lib/db";

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

  describe("validateResetToken", () => {
    beforeEach(() => {
      vi.mocked(getResetTokenByHash).mockReset();
    });

    it("returns invalid when token does not exist in DB", async () => {
      vi.mocked(getResetTokenByHash).mockResolvedValue(null);
      const result = await validateResetToken("any-raw-token");
      expect(result).toEqual<TokenValidationResult>({
        valid: false,
        error: "invalid",
      });
    });

    it("returns used when token has been used", async () => {
      vi.mocked(getResetTokenByHash).mockResolvedValue({
        readerId: "reader-123",
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: new Date(),
      });
      const result = await validateResetToken("used-token");
      expect(result).toEqual<TokenValidationResult>({
        valid: false,
        error: "used",
      });
    });

    it("returns expired when token has expired", async () => {
      vi.mocked(getResetTokenByHash).mockResolvedValue({
        readerId: "reader-123",
        expiresAt: new Date(Date.now() - 1000),
        usedAt: null,
      });
      const result = await validateResetToken("expired-token");
      expect(result).toEqual<TokenValidationResult>({
        valid: false,
        error: "expired",
      });
    });

    it("returns valid with readerId when token exists, not used, not expired", async () => {
      vi.mocked(getResetTokenByHash).mockResolvedValue({
        readerId: "reader-456",
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });
      const result = await validateResetToken("valid-token");
      expect(result).toEqual<TokenValidationResult>({
        valid: true,
        readerId: "reader-456",
      });
    });

    it("hashes raw token before DB lookup", async () => {
      vi.mocked(getResetTokenByHash).mockResolvedValue(null);
      await validateResetToken("my-token");
      expect(getResetTokenByHash).toHaveBeenCalledWith(hashToken("my-token"));
    });
  });

  describe("checkRateLimit", () => {
    beforeEach(() => {
      mockCountRecentResetRequests.mockReset();
      mockCountRecentResetRequestsByIp.mockReset();
    });

    it("returns allowed: true when both counts are below limits", async () => {
      mockCountRecentResetRequests.mockResolvedValue(2);
      mockCountRecentResetRequestsByIp.mockResolvedValue(5);
      const result = await checkRateLimit("user@example.com", "192.168.1.1");
      expect(result).toEqual({ allowed: true });
    });

    it("returns allowed: false when email count >= 3", async () => {
      mockCountRecentResetRequests.mockResolvedValue(3);
      mockCountRecentResetRequestsByIp.mockResolvedValue(0);
      const result = await checkRateLimit("user@example.com", "192.168.1.1");
      expect(result).toEqual({
        allowed: false,
        retryAfterSeconds: 3600,
      });
    });

    it("returns allowed: false when IP count >= 10", async () => {
      mockCountRecentResetRequests.mockResolvedValue(0);
      mockCountRecentResetRequestsByIp.mockResolvedValue(10);
      const result = await checkRateLimit("user@example.com", "192.168.1.1");
      expect(result).toEqual({
        allowed: false,
        retryAfterSeconds: 3600,
      });
    });

    it("queries both email and IP counts in parallel", async () => {
      mockCountRecentResetRequests.mockResolvedValue(0);
      mockCountRecentResetRequestsByIp.mockResolvedValue(0);
      await checkRateLimit("user@example.com", "10.0.0.1");
      expect(mockCountRecentResetRequests).toHaveBeenCalledWith(
        "user@example.com",
        60
      );
      expect(mockCountRecentResetRequestsByIp).toHaveBeenCalledWith(
        "10.0.0.1",
        60
      );
    });
  });
});
