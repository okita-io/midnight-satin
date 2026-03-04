"use server";

import { sql } from "@vercel/postgres";
import { getSession } from "@/lib/auth/session";

export type FollowAuthorResult =
  | { success: true; followed: boolean; newFollowerCount: number }
  | { success: false; error: string };

/**
 * Follow an author. Idempotent: already following = no-op (Property 17).
 * Returns current follower count.
 */
export async function followAuthor(authorId: string): Promise<FollowAuthorResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please log in to follow authors." };

  try {
    const { rows: existing } = await sql`
      SELECT 1 FROM author_follows
      WHERE reader_id = ${session.readerId} AND author_id = ${authorId}
    `;

    if (existing.length > 0) {
      const { rows: countRows } = await sql<{ follower_count: number }>`
        SELECT follower_count FROM author_profiles WHERE id = ${authorId}
      `;
      const newCount = countRows[0]?.follower_count ?? 0;
      return { success: true, followed: true, newFollowerCount: newCount };
    }

    try {
      await sql`
        INSERT INTO author_follows (reader_id, author_id)
        VALUES (${session.readerId}, ${authorId})
      `;
    } catch (err: unknown) {
      // Unique violation = concurrent follow; treat as idempotent success (Property 17)
      const code = (err as { code?: string })?.code;
      if (code === "23505") {
        const { rows: countRows } = await sql<{ follower_count: number }>`
          SELECT follower_count FROM author_profiles WHERE id = ${authorId}
        `;
        return {
          success: true,
          followed: true,
          newFollowerCount: countRows[0]?.follower_count ?? 0,
        };
      }
      throw err;
    }
    const { rows: countRows } = await sql<{ follower_count: number }>`
      UPDATE author_profiles
      SET follower_count = follower_count + 1
      WHERE id = ${authorId}
      RETURNING follower_count
    `;
    const newCount = countRows[0]?.follower_count ?? 0;
    return { success: true, followed: true, newFollowerCount: newCount };
  } catch {
    return { success: false, error: "Failed to update follow." };
  }
}

/** Check if the current reader follows an author. */
export async function isAuthorFollowed(authorId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  try {
    const { rows } = await sql`
      SELECT 1 FROM author_follows
      WHERE reader_id = ${session.readerId} AND author_id = ${authorId}
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}
