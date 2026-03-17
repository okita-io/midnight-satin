/**
 * Resend SDK wrapper for password reset email delivery.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.4
 */

import { Resend } from "resend";

export interface SendResetEmailParams {
  to: string;
  resetUrl: string;
  expiresInMinutes: number;
}

export interface SendResetEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Checks if Resend is properly configured.
 * Returns true only when both RESEND_API_KEY and RESEND_FROM_EMAIL are set and non-empty.
 * Requirements: 8.1, 8.2
 */
export function isResendConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  return Boolean(apiKey?.trim() && fromEmail?.trim());
}

/**
 * Renders the password reset email HTML with Midnight Satin branding.
 * Includes expiry notice (Req 3.4), security warning (Req 3.5), and reset link (Req 3.2).
 */
function buildResetEmailHtml(params: SendResetEmailParams): string {
  const { resetUrl, expiresInMinutes } = params;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password — Midnight Satin</title>
</head>
<body style="margin:0;padding:0;background-color:#050505;font-family:'Literata',Georgia,serif;color:#EAEAEA;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#050505;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background-color:#121212;border:1px solid rgba(212,175,55,0.3);border-radius:4px;">
          <tr>
            <td style="padding:32px 28px;">
              <h1 style="margin:0 0 24px;font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:700;font-style:italic;color:#D4AF37;">
                Midnight Satin
              </h1>
              <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#EAEAEA;">
                You requested a password reset for your account.
              </p>
              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#EAEAEA;">
                Click the button below to set a new password:
              </p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 0 28px;">
                <tr>
                  <td style="background-color:#D4AF37;border-radius:4px;">
                    <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;font-family:'Marcellus',Georgia,serif;font-size:14px;color:#050505;text-decoration:none;font-weight:500;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#8A8A8A;">
                <strong style="color:#D4AF37;">This link expires in ${expiresInMinutes} minute${expiresInMinutes === 1 ? "" : "s"}.</strong> If you did not request a reset, you can safely ignore this email.
              </p>
              <p style="margin:0;font-size:14px;line-height:1.6;color:#8A8A8A;">
                <strong style="color:#800020;">Security notice:</strong> Do not share this link with anyone. Midnight Satin will never ask for your password or this link by email.
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#8A8A8A;">
          © Midnight Satin — Your premium romance reading sanctuary
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Sends a password reset email via the Resend SDK.
 * Uses RESEND_API_KEY and RESEND_FROM_EMAIL from environment.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.4
 */
export async function sendResetEmail(
  params: SendResetEmailParams
): Promise<SendResetEmailResult> {
  if (!isResendConfigured()) {
    return {
      success: false,
      error: "Resend is not configured (missing RESEND_API_KEY or RESEND_FROM_EMAIL)",
    };
  }

  const apiKey = process.env.RESEND_API_KEY!.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL!.trim();

  try {
    const resend = new Resend(apiKey);
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: params.to,
      subject: "Reset your password — Midnight Satin",
      html: buildResetEmailHtml(params),
    });

    if (error) {
      return {
        success: false,
        error: error.message ?? "Resend API error",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return {
      success: false,
      error: message,
    };
  }
}
