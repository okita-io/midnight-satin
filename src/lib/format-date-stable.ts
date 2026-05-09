/**
 * Deterministic date formatting using UTC getters — same output on server and client
 * (avoids hydration mismatches from locale/timezone differences).
 */

function toValidDate(input: Date | string): Date | null {
  const d = input instanceof Date ? input : new Date(input);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** YYYY-MM-DD in UTC (admin tables). */
export function formatDateUtcYmd(input: Date | string): string {
  const d = toValidDate(input);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

/** YYYY-MM-DD HH:MM in UTC (admin audit / moderation). */
export function formatDateTimeUtc(input: Date | string): string {
  const d = toValidDate(input);
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}
