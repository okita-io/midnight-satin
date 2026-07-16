import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";

export type AdminGateError = { success: false; error: "Forbidden" };

/** True when session exists and Neon role is admin (not Clerk Organizations). */
export function isAdminSession(
  session: SessionPayload | null | undefined
): session is SessionPayload & { role: "admin" } {
  return !!session && session.role === "admin";
}

/**
 * Gate for admin server actions. Returns an error object when not admin;
 * null when the caller may proceed.
 */
export function checkAdminSession(
  session: SessionPayload | null | undefined
): AdminGateError | null {
  if (!isAdminSession(session)) {
    return { success: false, error: "Forbidden" };
  }
  return null;
}

/**
 * Gate for admin Server Components / layouts.
 * Requires Clerk sign-in (via proxy) and `readers.role === 'admin'`.
 */
export async function requireAdminPage(redirectTo = "/"): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent("/admin")}`);
  }
  if (!isAdminSession(session)) {
    redirect(redirectTo);
  }
  return session;
}
