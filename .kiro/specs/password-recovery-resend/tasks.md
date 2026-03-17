# Implementation Plan: Password Recovery & Resend

## Overview

This plan implements a two-phase password recovery flow for the Midnight Satin platform. The implementation follows the existing Next.js 16 App Router patterns, adds two Postgres tables for token storage and security logging, and integrates with Resend for email delivery. Tasks are ordered to build incrementally with early validation of core functionality.

## Tasks

- [ ] 1. Set up database schema and types
  - [ ] 1.1 Create password_reset_tokens table migration
    - Add SQL migration for `password_reset_tokens` table with columns: id, reader_id, token_hash, expires_at, used_at, created_at, ip_address
    - Add indexes on token_hash, reader_id, and created_at
    - _Requirements: 2.3, 2.4, 2.6_

  - [ ] 1.2 Create password_reset_log table migration
    - Add SQL migration for `password_reset_log` table with columns: id, event_type, reader_id, ip_address, reason_code, created_at
    - Add CHECK constraint for valid event_type values
    - Add indexes on created_at and reader_id
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 1.3 Add TypeScript types for password reset
    - Add `PasswordResetToken` interface to `src/lib/db/types.ts`
    - Add `PasswordResetEventType` type union
    - Add `PasswordResetLogEntry` interface
    - _Requirements: 2.3, 7.1_

- [ ] 2. Implement core password reset logic
  - [ ] 2.1 Implement token generation and hashing in `src/lib/auth/password-reset.ts`
    - Implement `generateResetToken()` using crypto.randomBytes (32 bytes, base64url encoded)
    - Implement `hashToken()` using SHA-256
    - Export `ResetTokenResult` interface
    - _Requirements: 2.1, 2.2, 2.6_

  - [ ] 2.2 Write property test for token entropy
    - **Property 4: Token generation meets minimum entropy**
    - **Validates: Requirements 2.1, 2.2**

  - [ ] 2.3 Write property test for token hashing
    - **Property 5: Token storage round-trip**
    - **Validates: Requirements 2.3, 2.6**

  - [x] 2.4 Implement token validation logic
    - Implement `validateResetToken()` that checks existence, expiry, and used status
    - Return `TokenValidationResult` with valid flag and optional error type
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [ ] 2.5 Write property test for token expiration
    - **Property 6: Token expiration**
    - **Validates: Requirements 2.4**

  - [ ] 2.6 Write property test for token validation states
    - **Property 10: Token validation correctness**
    - **Validates: Requirements 4.1, 4.2, 4.3, 4.4**

  - [ ] 2.7 Implement rate limiting logic
    - Implement `checkRateLimit()` that checks email (3/hour) and IP (10/hour) limits
    - Query `password_reset_tokens` table for counts within sliding window
    - Return `RateLimitCheck` with allowed flag
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 2.8 Write property tests for rate limiting
    - **Property 14: Email rate limiting**
    - **Property 15: IP rate limiting**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 3. Checkpoint - Core logic complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement database query helpers
  - [ ] 4.1 Add password reset token queries to `src/lib/db/index.ts`
    - Implement `createPasswordResetToken()`
    - Implement `invalidateResetTokensForReader()`
    - Implement `getResetTokenByHash()`
    - Implement `markResetTokenUsed()`
    - _Requirements: 2.3, 2.5, 5.5_

  - [ ] 4.2 Add rate limiting queries
    - Implement `countRecentResetRequests()` for email-based counting
    - Implement `countRecentResetRequestsByIp()` for IP-based counting
    - _Requirements: 6.1, 6.2_

  - [ ] 4.3 Add security logging queries
    - Implement `logPasswordResetEvent()` that inserts into password_reset_log
    - Ensure no sensitive data (email, token, password) is logged in plaintext
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ] 4.4 Write property test for log sanitization
    - **Property 17: No sensitive data in logs**
    - **Validates: Requirements 7.4**

- [ ] 5. Implement Resend email integration
  - [ ] 5.1 Create Resend wrapper in `src/lib/auth/resend.ts`
    - Implement `isResendConfigured()` checking RESEND_API_KEY and RESEND_FROM_EMAIL
    - Implement `sendResetEmail()` using Resend SDK
    - Include Midnight Satin branding, expiry notice (1 hour), and security warning in email template
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.4_

  - [ ] 5.2 Write property test for email content
    - **Property 8: Email contains reset link with token**
    - **Validates: Requirements 3.1, 3.2**

  - [ ] 5.3 Write property test for missing env vars
    - **Property 18: Missing environment variables disable feature**
    - **Validates: Requirements 8.3**

  - [ ] 5.4 Write unit tests for email template
    - Test email HTML contains expiry notice, security warning, branding elements
    - Test `isResendConfigured()` with various env var states
    - _Requirements: 3.3, 3.4, 3.5, 8.3_

- [ ] 6. Checkpoint - Backend services complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Implement server actions
  - [ ] 7.1 Create `requestPasswordResetAction` in `src/app/actions/password-reset.ts`
    - Validate email format
    - Check rate limits (email + IP)
    - Look up reader by email
    - Generate token, invalidate existing tokens, store new token hash
    - Send email via Resend (handle failures gracefully)
    - Log all events
    - Always return generic success message
    - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.3, 2.5, 3.1, 3.6, 6.1, 6.2, 6.3, 6.4, 7.1, 7.3_

  - [ ] 7.2 Write property test for response uniformity
    - **Property 3: Response uniformity**
    - **Validates: Requirements 1.5, 6.3**

  - [ ] 7.3 Write property test for email validation
    - **Property 1: Valid email acceptance**
    - **Property 2: Invalid email rejection**
    - **Validates: Requirements 1.3, 1.4**

  - [ ] 7.4 Write property test for email failure handling
    - **Property 9: Email failure does not change user response**
    - **Validates: Requirements 3.6**

  - [ ] 7.5 Create `resetPasswordAction` in `src/app/actions/password-reset.ts`
    - Validate token from form data
    - Validate password (min 8 chars) and confirmation match
    - Update reader password hash
    - Mark token as used
    - Log success event
    - Redirect to login with success message
    - _Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 7.2_

  - [ ] 7.6 Write property test for password validation
    - **Property 12: Password validation rules**
    - **Validates: Requirements 5.2, 5.3**

  - [ ] 7.7 Write property test for password reset round-trip
    - **Property 13: Password reset round-trip**
    - **Validates: Requirements 5.4, 5.5**

  - [ ] 7.8 Write property test for token invalidation on re-request
    - **Property 7: Token invalidation on re-request**
    - **Validates: Requirements 2.5**

- [ ] 8. Checkpoint - Server actions complete
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Implement forgot password UI
  - [ ] 9.1 Create forgot password page at `src/app/auth/forgot-password/page.tsx`
    - Server component that checks if Resend is configured
    - Show "temporarily unavailable" message if not configured
    - Render ForgotPasswordForm component
    - _Requirements: 1.1, 8.3_

  - [ ] 9.2 Create forgot password form at `src/app/auth/forgot-password/forgot-password-form.tsx`
    - Client component with email input field
    - Use `useActionState` with `requestPasswordResetAction`
    - Display validation errors for invalid email format
    - Display generic success message after submission
    - Apply Premium_Aesthetic with gold accents and dark theme
    - _Requirements: 1.2, 1.4, 1.5, 1.6_

  - [ ] 9.3 Add "Forgot Password?" link to login form
    - Modify `src/app/auth/login/login-form.tsx`
    - Add link below password field pointing to `/auth/forgot-password`
    - _Requirements: 1.1_

- [ ] 10. Implement reset password UI
  - [ ] 10.1 Create reset password page at `src/app/auth/reset-password/page.tsx`
    - Server component that validates token from URL query parameter
    - If valid: render ResetPasswordForm with token
    - If invalid/expired/used: render error message with link to request new reset
    - Use uniform error message for all invalid states
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ] 10.2 Write property test for token error uniformity
    - **Property 11: Token error message uniformity**
    - **Validates: Requirements 4.5**

  - [ ] 10.3 Create reset password form at `src/app/auth/reset-password/reset-password-form.tsx`
    - Client component with new password and confirmation fields
    - Use `useActionState` with `resetPasswordAction`
    - Display validation errors for short password or mismatch
    - Include hidden field for token
    - Apply Premium_Aesthetic consistent with other auth pages
    - _Requirements: 5.1, 5.2, 5.3, 5.7_

  - [ ] 10.4 Handle success redirect on login page
    - Check for `reset=success` query parameter on login page
    - Display success banner: "Password updated. Please sign in."
    - _Requirements: 5.6_

- [ ] 11. Implement security logging
  - [ ] 11.1 Add logging calls throughout the flow
    - Log `reset_requested` on form submission
    - Log `token_generated` when token created
    - Log `email_sent` or `email_failed` after Resend call
    - Log `token_validated`, `token_invalid`, `token_expired`, or `token_used` on validation
    - Log `password_changed` on successful reset
    - Log `rate_limited` when limits exceeded
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 11.2 Write property test for logging completeness
    - **Property 16: Security logging completeness**
    - **Validates: Requirements 7.1, 7.2, 7.3**

- [ ] 12. Final checkpoint - All tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with vitest (already installed)
- Integration tests requiring database should skip if no `POSTGRES_URL` env var
- The design uses TypeScript throughout, consistent with the existing codebase
