/**
 * Email format validation for auth flows.
 * Used by: password reset (Req 1.3, 1.4), registration, login.
 *
 * Valid format: contains @, domain part with TLD, no whitespace.
 * Invalid: empty, whitespace-only, missing @, missing domain/TLD.
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
