/**
 * Unit tests for Resend wrapper: isResendConfigured, sendResetEmail, email template.
 * Requirements: 3.3, 3.4, 3.5, 8.1, 8.2, 8.4
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  isResendConfigured,
  sendResetEmail,
  type SendResetEmailParams,
} from "@/lib/auth/resend";

const mockEmailsSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class MockResend {
    emails = { send: mockEmailsSend };
  },
}));

const originalEnv = process.env;

describe("resend", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("isResendConfigured", () => {
    it("returns false when RESEND_API_KEY is missing", () => {
      process.env.RESEND_API_KEY = "";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      expect(isResendConfigured()).toBe(false);
    });

    it("returns false when RESEND_FROM_EMAIL is missing", () => {
      process.env.RESEND_API_KEY = "re_abc123";
      process.env.RESEND_FROM_EMAIL = "";
      expect(isResendConfigured()).toBe(false);
    });

    it("returns false when both are missing", () => {
      delete process.env.RESEND_API_KEY;
      delete process.env.RESEND_FROM_EMAIL;
      expect(isResendConfigured()).toBe(false);
    });

    it("returns false when RESEND_API_KEY is whitespace only", () => {
      process.env.RESEND_API_KEY = "   ";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      expect(isResendConfigured()).toBe(false);
    });

    it("returns false when RESEND_FROM_EMAIL is whitespace only", () => {
      process.env.RESEND_API_KEY = "re_abc123";
      process.env.RESEND_FROM_EMAIL = "   ";
      expect(isResendConfigured()).toBe(false);
    });

    it("returns true when both are set and non-empty", () => {
      process.env.RESEND_API_KEY = "re_abc123";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      expect(isResendConfigured()).toBe(true);
    });

    it("returns true when values have surrounding whitespace (trimmed)", () => {
      process.env.RESEND_API_KEY = "  re_abc123  ";
      process.env.RESEND_FROM_EMAIL = "  noreply@midnightsatin.com  ";
      expect(isResendConfigured()).toBe(true);
    });
  });

  describe("sendResetEmail", () => {
    const params: SendResetEmailParams = {
      to: "reader@example.com",
      resetUrl: "https://app.example.com/auth/reset-password?token=abc123",
      expiresInMinutes: 60,
    };

    it("returns error when Resend is not configured", async () => {
      process.env.RESEND_API_KEY = "";
      process.env.RESEND_FROM_EMAIL = "";
      const result = await sendResetEmail(params);
      expect(result).toEqual({
        success: false,
        error: "Resend is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL)",
      });
      expect(mockEmailsSend).not.toHaveBeenCalled();
    });

    it("calls Resend API with correct params when configured", async () => {
      process.env.RESEND_API_KEY = "re_xyz";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      mockEmailsSend.mockResolvedValue({ data: { id: "msg_123" }, error: null });

      const result = await sendResetEmail(params);

      expect(result.success).toBe(true);
      expect(result.messageId).toBe("msg_123");
      expect(mockEmailsSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "noreply@midnightsatin.com",
          to: "reader@example.com",
          subject: "Reset your password — Midnight Satin",
        })
      );
    });

    it("returns error when Resend API returns error", async () => {
      process.env.RESEND_API_KEY = "re_xyz";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      mockEmailsSend.mockResolvedValue({
        data: null,
        error: { message: "Invalid API key" },
      });

      const result = await sendResetEmail(params);

      expect(result).toEqual({
        success: false,
        error: "Invalid API key",
      });
    });

    it("returns error when Resend throws", async () => {
      process.env.RESEND_API_KEY = "re_xyz";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      mockEmailsSend.mockRejectedValue(new Error("Network error"));

      const result = await sendResetEmail(params);

      expect(result).toEqual({
        success: false,
        error: "Network error",
      });
    });
  });

  describe("email template content", () => {
    const params: SendResetEmailParams = {
      to: "reader@example.com",
      resetUrl: "https://app.example.com/auth/reset-password?token=xyz789",
      expiresInMinutes: 60,
    };

    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_xyz";
      process.env.RESEND_FROM_EMAIL = "noreply@midnightsatin.com";
      mockEmailsSend.mockResolvedValue({ data: { id: "msg_1" }, error: null });
    });

    it("includes Midnight Satin branding (Req 3.3)", async () => {
      await sendResetEmail(params);
      const html = mockEmailsSend.mock.calls[0][0].html;
      expect(html).toContain("Midnight Satin");
      expect(html).toContain("#D4AF37");
      expect(html).toContain("#050505");
      expect(html).toContain("#121212");
    });

    it("includes reset link with token (Req 3.2)", async () => {
      await sendResetEmail(params);
      const html = mockEmailsSend.mock.calls[0][0].html;
      expect(html).toContain(params.resetUrl);
      expect(html).toContain("Reset Password");
    });

    it("includes expiry notice for 1 hour (Req 3.4)", async () => {
      await sendResetEmail(params);
      const html = mockEmailsSend.mock.calls[0][0].html;
      expect(html).toContain("expires in 60 minutes");
    });

    it("includes expiry notice for 1 minute (singular)", async () => {
      await sendResetEmail({ ...params, expiresInMinutes: 1 });
      const html = mockEmailsSend.mock.calls[0][0].html;
      expect(html).toContain("expires in 1 minute");
    });

    it("includes security warning (Req 3.5)", async () => {
      await sendResetEmail(params);
      const html = mockEmailsSend.mock.calls[0][0].html;
      expect(html).toContain("Security notice");
      expect(html).toContain("Do not share this link with anyone");
      expect(html).toContain("Midnight Satin will never ask for your password or this link by email");
    });

    it("includes footer branding (Req 3.3)", async () => {
      await sendResetEmail(params);
      const html = mockEmailsSend.mock.calls[0][0].html;
      expect(html).toContain("Your premium romance reading sanctuary");
    });
  });
});
