"use server";

import { redirect } from "next/navigation";
import { deleteSession, getSession } from "@/lib/auth/session";

export type AuthFormState = { error: string } | null;

/** Clear Clerk session (+ legacy cookie) and redirect to Boudoir. */
export async function logoutReader(): Promise<void> {
  try {
    const { auth, clerkClient } = await import("@clerk/nextjs/server");
    const { sessionId } = await auth();
    if (sessionId) {
      const client = await clerkClient();
      await client.sessions.revokeSession(sessionId);
    }
  } catch {
    // Still clear legacy cookie below.
  }
  await deleteSession();
  redirect("/");
}

/** Current session for Server Components (Clerk → Neon reader). */
export async function getCurrentSession() {
  return getSession();
}

/** Current reader for Server Components (Clerk → Neon reader). */
export async function getCurrentReader() {
  const { ensureReaderForClerkUser } = await import("@/lib/auth/clerk-reader");
  try {
    const linked = await ensureReaderForClerkUser();
    if (linked) return linked.reader;
  } catch {
    return null;
  }
  return null;
}
