import { cookies } from "next/headers";
import type { SessionPayload } from "./session-types";

export type { SessionPayload } from "./session-types";

/** Legacy cookie name — cleared on logout for readers still holding JWT sessions. */
const LEGACY_COOKIE_NAME = "midnight-satin-session";

/**
 * Current app session is Clerk-backed and resolved to a Neon `readers` row.
 * Returns null when signed out or when the Clerk↔reader link cannot be created.
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const { ensureReaderForClerkUser } = await import("./clerk-reader");
    const linked = await ensureReaderForClerkUser();
    return linked?.session ?? null;
  } catch {
    return null;
  }
}

/** Require a session or throw. Prefer this in Server Actions. */
export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

/** Clear legacy JWT cookie if present (Clerk sign-out is authoritative). */
export async function deleteSession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(LEGACY_COOKIE_NAME);
  } catch {
    // cookies() unavailable outside a request context (e.g. some tests)
  }
}

/** @deprecated Prefer Clerk UserButton / signOut. Kept for logoutReader. */
export function getSessionCookieName(): string {
  return LEGACY_COOKIE_NAME;
}
