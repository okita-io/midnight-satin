"use server";

/**
 * Password reset server actions.
 * Requirements: 1.3, 1.4, 1.5, 2.1, 2.3, 2.5, 3.1, 3.6, 5.2, 5.3, 5.4, 5.5, 5.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.2, 7.3
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  generateResetToken,
  checkRateLimit,
  validateResetToken,
  validatePasswordForReset,
  hashToken,
} from "@/lib/auth/password-reset";
import { hashPassword } from "@/lib/auth/password";
import { sendResetEmail, isResendConfigured } from "@/lib/auth/resend";
import { isValidEmail } from "@/lib/auth/email-validation";
import {
  getReaderByEmailWithPassword,
  createPasswordResetToken,
  invalidateResetTokensForReader,
  logPasswordResetEvent,
  markResetTokenUsed,
  updateReaderPassword,
} from "@/lib/db";

const TOKEN_EXPIRY_MINUTES = 60;
const GENERIC_SUCCESS_MESSAGE =
  "If an account with that email exists, we've sent a reset link.";

/** Extract client IP from request headers (Vercel sets x-forwarded-for). */
async function getClientIp(): Promise<string> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      const first = forwarded.split(",")[0]?.trim();
      if (first) return first;
    }
    const realIp = h.get("x-real-ip");
    if (realIp) return realIp;
  } catch {
    // headers() can throw in some edge cases
  }
  return "";
}

export type PasswordResetRequestState = {
  message: string;
  success: boolean;
} | null;

/**
 * Server action for forgot-password form.
 * Validates email, checks rate limits, looks up reader, generates token,
 * invalidates existing tokens, stores new token, sends email via Resend,
 * logs all events. Always returns generic success message (Req 1.5, 6.3).
 */
export async function requestPasswordResetAction(
  _prev: PasswordResetRequestState,
  formData: FormData
): Promise<PasswordResetRequestState> {
  const email = ((formData.get("email") as string) ?? "").trim().toLowerCase();
  const ipAddress = await getClientIp();

  // 1. Validate email format (Req 1.3, 1.4)
  if (!email) {
    return {
      message: "Please enter a valid email address.",
      success: false,
    };
  }
  if (!isValidEmail(email)) {
    return {
      message: "Please enter a valid email address.",
      success: false,
    };
  }

  // 2. Check rate limits (email + IP) (Req 6.1, 6.2)
  const rateLimit = await checkRateLimit(email, ipAddress);
  if (!rateLimit.allowed) {
    await logPasswordResetEvent("rate_limit", {
      ipAddress,
      reasonCode: "rate_limited",
    });
    return {
      message: GENERIC_SUCCESS_MESSAGE,
      success: true,
    };
  }

  // 3. Look up reader by email
  const reader = await getReaderByEmailWithPassword(email);

  // 4. If reader exists: generate token, invalidate existing, store new, send email
  if (reader) {
    const { token, tokenHash } = generateResetToken();
    const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);

    await invalidateResetTokensForReader(reader.id);
    await createPasswordResetToken(
      reader.id,
      tokenHash,
      expiresAt,
      ipAddress || null
    );

    // Log request (Req 7.1)
    await logPasswordResetEvent("request_sent", {
      readerId: reader.id,
      ipAddress: ipAddress || null,
    });

    // 5. Send email via Resend (handle failures gracefully) (Req 3.1, 3.6)
    if (!isResendConfigured()) {
      await logPasswordResetEvent("email_failed", {
        readerId: reader.id,
        ipAddress: ipAddress || null,
        reasonCode: "resend_error",
      });
      return {
        message: GENERIC_SUCCESS_MESSAGE,
        success: true,
      };
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "")
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    const sendResult = await sendResetEmail({
      to: email,
      resetUrl,
      expiresInMinutes: TOKEN_EXPIRY_MINUTES,
    });

    if (!sendResult.success) {
      await logPasswordResetEvent("email_failed", {
        readerId: reader.id,
        ipAddress: ipAddress || null,
        reasonCode: "resend_error",
      });
    }
  } else {
    // Reader not found: log attempt (Req 7.1) but no token/email
    await logPasswordResetEvent("request_sent", {
      ipAddress: ipAddress || null,
    });
  }

  // 6. Always return generic success message (Req 1.5, 6.3)
  return {
    message: GENERIC_SUCCESS_MESSAGE,
    success: true,
  };
}

export type PasswordResetState = { error: string } | null;

const INVALID_TOKEN_MESSAGE =
  "This reset link is no longer valid. Please request a new one.";

/**
 * Server action for reset-password form.
 * Validates token from form data, validates password (min 8 chars) and confirmation match,
 * updates reader password hash, marks token as used, logs success event,
 * redirects to login with success message. Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 7.2
 */
export async function resetPasswordAction(
  _prev: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const token = ((formData.get("token") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  const ipAddress = await getClientIp();

  // 1. Validate token from form data (Req 4.1, 4.2, 4.3, 4.4)
  if (!token) {
    return { error: INVALID_TOKEN_MESSAGE };
  }

  const validation = await validateResetToken(token);
  if (!validation.valid || !validation.readerId) {
    await logPasswordResetEvent("invalid_token", {
      ipAddress: ipAddress || null,
      reasonCode: validation.error ?? "invalid",
    });
    return { error: INVALID_TOKEN_MESSAGE };
  }

  const { readerId } = validation;

  // 2. Validate password (min 8 chars) and confirmation match (Req 5.2, 5.3)
  const passwordValidation = validatePasswordForReset(password, confirmPassword);
  if (!passwordValidation.valid) {
    return { error: passwordValidation.error };
  }

  // 3. Update reader password hash (Req 5.4)
  const passwordHash = await hashPassword(password);
  await updateReaderPassword(readerId, passwordHash);

  // 4. Mark token as used (Req 5.5)
  const tokenHash = hashToken(token);
  await markResetTokenUsed(tokenHash);

  // 5. Log success event (Req 7.2)
  await logPasswordResetEvent("password_changed", {
    readerId,
    ipAddress: ipAddress || null,
  });

  // 6. Redirect to login with success message (Req 5.6)
  redirect("/auth/login?reset=success");
}
