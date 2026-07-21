import type { SessionPayload } from "./session-types";
import { readerDbRowToReader, type Reader, type ReaderDbRow } from "@/lib/db/types";
import { sql } from "@/lib/db/postgres";

const WELCOME_BONUS_CREDITS = 200;

type ReaderLinkRow = ReaderDbRow & { clerk_user_id: string | null };

function toSessionPayload(reader: Reader): SessionPayload {
  const now = Math.floor(Date.now() / 1000);
  return {
    readerId: reader.id,
    email: reader.email,
    role: reader.role,
    iat: now,
    exp: now + 60 * 60 * 24 * 30,
  };
}

/** Look up reader by Clerk user id. */
export async function getReaderByClerkUserId(clerkUserId: string) {
  const { rows } = await sql<ReaderLinkRow>`
    SELECT id, email, password_hash, display_name, credit_balance, role,
           created_at, last_login_at, clerk_user_id
    FROM readers
    WHERE clerk_user_id = ${clerkUserId}
  `;
  if (rows.length === 0) return null;
  return readerDbRowToReader(rows[0]);
}

/**
 * Ensure a Neon `readers` row exists for the signed-in Clerk user.
 * Links by clerk_user_id, then by email (legacy accounts), otherwise creates
 * a new reader with the welcome credit bonus.
 */
export async function ensureReaderForClerkUser(): Promise<{
  reader: Reader;
  session: SessionPayload;
} | null> {
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId, isAuthenticated } = await auth();
  if (!isAuthenticated || !userId) return null;

  const existing = await getReaderByClerkUserId(userId);
  if (existing) {
    return {
      reader: existing,
      session: toSessionPayload(existing),
    };
  }

  const user = await currentUser();
  if (!user) return null;

  const email =
    user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() ??
    user.emailAddresses[0]?.emailAddress?.trim().toLowerCase() ??
    "";
  if (!email) return null;

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
    user.username ||
    email.split("@")[0];

  // Legacy Neon accounts: attach clerk_user_id when email matches.
  const { rows: byEmail } = await sql<ReaderLinkRow>`
    SELECT id, email, password_hash, display_name, credit_balance, role,
           created_at, last_login_at, clerk_user_id
    FROM readers
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;

  if (byEmail.length > 0) {
    const row = byEmail[0];
    await sql`
      UPDATE readers
      SET clerk_user_id = ${userId},
          last_login_at = NOW(),
          display_name = COALESCE(NULLIF(${displayName}, ''), display_name)
      WHERE id = ${row.id}
    `;
    const reader = readerDbRowToReader({
      ...row,
      display_name: row.display_name || displayName,
      last_login_at: new Date(),
    });
    return { reader, session: toSessionPayload(reader) };
  }

  const { rows: created } = await sql<ReaderLinkRow>`
    INSERT INTO readers (email, password_hash, display_name, credit_balance, role, clerk_user_id, last_login_at)
    VALUES (${email}, NULL, ${displayName}, ${WELCOME_BONUS_CREDITS}, 'reader', ${userId}, NOW())
    RETURNING id, email, password_hash, display_name, credit_balance, role,
              created_at, last_login_at, clerk_user_id
  `;

  if (created.length === 0) return null;
  const readerId = created[0].id;

  await sql`
    INSERT INTO credit_transactions (reader_id, amount, transaction_type)
    VALUES (${readerId}, ${WELCOME_BONUS_CREDITS}, 'welcome_bonus')
  `;

  const reader = readerDbRowToReader(created[0]);
  return { reader, session: toSessionPayload(reader) };
}

/** Upsert reader from a Clerk webhook payload (async sync). */
export async function upsertReaderFromClerkWebhook(data: {
  id: string;
  email_addresses?: Array<{ email_address: string }>;
  primary_email_address_id?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
}): Promise<void> {
  const clerkUserId = data.id;
  const emails = data.email_addresses ?? [];
  const primary =
    emails.find((e) => e.email_address)?.email_address ??
    emails[0]?.email_address;
  const email = primary?.trim().toLowerCase();
  if (!email) return;

  const displayName =
    [data.first_name, data.last_name].filter(Boolean).join(" ").trim() ||
    data.username ||
    email.split("@")[0];

  const existing = await getReaderByClerkUserId(clerkUserId);
  if (existing) {
    await sql`
      UPDATE readers
      SET email = ${email},
          display_name = COALESCE(NULLIF(${displayName}, ''), display_name),
          last_login_at = NOW()
      WHERE clerk_user_id = ${clerkUserId}
    `;
    return;
  }

  const { rows: byEmail } = await sql<{ id: string }>`
    SELECT id FROM readers WHERE LOWER(email) = ${email} LIMIT 1
  `;
  if (byEmail.length > 0) {
    await sql`
      UPDATE readers
      SET clerk_user_id = ${clerkUserId},
          display_name = COALESCE(NULLIF(${displayName}, ''), display_name),
          last_login_at = NOW()
      WHERE id = ${byEmail[0].id}
    `;
    return;
  }

  const { rows: created } = await sql<{ id: string }>`
    INSERT INTO readers (email, password_hash, display_name, credit_balance, role, clerk_user_id, last_login_at)
    VALUES (${email}, NULL, ${displayName}, ${WELCOME_BONUS_CREDITS}, 'reader', ${clerkUserId}, NOW())
    RETURNING id
  `;
  if (created.length === 0) return;
  await sql`
    INSERT INTO credit_transactions (reader_id, amount, transaction_type)
    VALUES (${created[0].id}, ${WELCOME_BONUS_CREDITS}, 'welcome_bonus')
  `;
}
