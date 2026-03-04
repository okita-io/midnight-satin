/**
 * Midnight Satin Cache Layer
 * Vercel KV with TTL 300s for frequently accessed data (Req 11.3)
 * Gracefully falls back to no cache when KV is not configured (e.g. local dev)
 */

import { kv } from "@vercel/kv";

const DEFAULT_TTL_SECONDS = 300;

/** Cache key prefixes for namespacing */
const KEYS = {
  featured: "ms:featured",
  trending: "ms:trending",
  author: "ms:author:",
} as const;

/** Check if KV is available (env vars set). Avoids throwing on first access. */
function isKvAvailable(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

/**
 * Get cached value. Returns null if not found or KV unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!isKvAvailable()) return null;
  try {
    const value = await kv.get<T>(key);
    return value;
  } catch {
    return null;
  }
}

/**
 * Set cached value with TTL. No-op if KV unavailable.
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  if (!isKvAvailable()) return;
  try {
    await kv.set(key, value, { ex: ttlSeconds });
  } catch {
    // Silently ignore cache write failures
  }
}

/**
 * Get or compute and cache a value.
 * @param key Cache key
 * @param fn Function to compute value when cache miss
 * @param ttlSeconds TTL in seconds (default 300)
 */
export async function cacheGetOrSet<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached != null) return cached;
  const value = await fn();
  await cacheSet(key, value, ttlSeconds);
  return value;
}

/** Cache key for featured novels */
export function cacheKeyFeatured(): string {
  return KEYS.featured;
}

/** Cache key for trending novels */
export function cacheKeyTrending(): string {
  return KEYS.trending;
}

/** Cache key for author profile */
export function cacheKeyAuthor(authorId: string): string {
  return KEYS.author + authorId;
}
