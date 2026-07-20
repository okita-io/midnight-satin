/**
 * Allow only same-origin relative paths for post-auth redirects.
 * Rejects protocol-relative, absolute, and empty values.
 */
export function safeRedirectPath(
  value: string | string[] | undefined | null,
  fallback = "/"
): string {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== "string") return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
