"use server";

import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { getReaderByEmailWithPassword, readerExistsByEmail } from "@/lib/db";

export type AuthFormState = { error: string } | null;

const WELCOME_BONUS_CREDITS = 200;
const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export type RegisterResult =
  | { success: true; readerId: string }
  | { success: false; error: string };

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

/** Register a new reader with 200 credit welcome bonus. */
export async function registerReader(
  email: string,
  password: string,
  displayName: string
): Promise<RegisterResult> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedName = displayName.trim();

  if (!trimmedEmail) return { success: false, error: "Email is required." };
  if (!isValidEmail(trimmedEmail)) return { success: false, error: "Please enter a valid email address." };
  if (password.length < MIN_PASSWORD_LENGTH) return { success: false, error: "Password must be at least 8 characters." };
  if (!trimmedName) return { success: false, error: "Display name is required." };

  const exists = await readerExistsByEmail(trimmedEmail);
  if (exists) return { success: false, error: "Email already in use." };

  const passwordHash = await hashPassword(password);

  const { rows: readerRows } = await sql`
    INSERT INTO readers (email, password_hash, display_name, credit_balance, role)
    VALUES (${trimmedEmail}, ${passwordHash}, ${trimmedName}, ${WELCOME_BONUS_CREDITS}, 'reader')
    RETURNING id
  `;
  if (readerRows.length === 0) return { success: false, error: "Registration failed. Please try again." };
  const readerId = readerRows[0].id as string;

  await sql`
    INSERT INTO credit_transactions (reader_id, amount, transaction_type)
    VALUES (${readerId}, ${WELCOME_BONUS_CREDITS}, 'welcome_bonus')
  `;

  await createSession(readerId, trimmedEmail, "reader");
  return { success: true, readerId };
}

/** Log in with email and password. */
export async function loginReader(email: string, password: string): Promise<LoginResult> {
  const trimmedEmail = email.trim().toLowerCase();
  if (!trimmedEmail) return { success: false, error: "Email is required." };
  if (!password) return { success: false, error: "Password is required." };

  const row = await getReaderByEmailWithPassword(trimmedEmail);
  if (!row) return { success: false, error: "Invalid email or password." };

  const valid = await verifyPassword(password, row.password_hash);
  if (!valid) return { success: false, error: "Invalid email or password." };

  await sql`UPDATE readers SET last_login_at = NOW() WHERE id = ${row.id}`;
  await createSession(row.id, row.email, row.role);
  return { success: true };
}

/** Clear session and log out. Redirects to Boudoir (Req 18.8). */
export async function logoutReader(): Promise<void> {
  await deleteSession();
  redirect("/");
}

/** Get current session (for Server Components). Returns null if not logged in. */
export async function getCurrentSession() {
  return getSession();
}

/** Get current reader (for Server Components). Returns null if not logged in. */
export async function getCurrentReader() {
  const session = await getSession();
  if (!session) return null;
  const { getReaderById } = await import("@/lib/db");
  return getReaderById(session.readerId);
}

/** Server action for login form (use with useActionState). Redirects on success. */
export async function loginFormAction(prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const redirectTo = ((formData.get("redirectTo") as string) ?? "").trim() || "/";
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const result = await loginReader(email, password);
  if (result.success) redirect(redirectTo);
  return { error: result.error };
}

/** Server action for register form (use with useActionState). Redirects on success. */
export async function registerFormAction(prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const redirectTo = ((formData.get("redirectTo") as string) ?? "").trim() || "/";
  const email = (formData.get("email") as string) ?? "";
  const password = (formData.get("password") as string) ?? "";
  const displayName = (formData.get("displayName") as string) ?? "";
  const confirmPassword = (formData.get("confirmPassword") as string) ?? "";
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  const result = await registerReader(email, password, displayName);
  if (result.success) redirect(redirectTo);
  return { error: result.error };
}
