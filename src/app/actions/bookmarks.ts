"use server";

import { sql } from "@/lib/db/postgres";
import { getSession } from "@/lib/auth/session";

export type ToggleBookmarkResult =
  | { success: true; bookmarked: boolean }
  | { success: false; error: string };

/** Toggle bookmark for a novel. Requires authentication. */
export async function toggleBookmark(
  novelId: string,
  chapterId?: string
): Promise<ToggleBookmarkResult> {
  const session = await getSession();
  if (!session) return { success: false, error: "Please log in to bookmark." };

  try {
    const { rows: existing } = await sql`
      SELECT 1 FROM reader_bookmarks
      WHERE reader_id = ${session.readerId} AND novel_id = ${novelId}
    `;

    if (existing.length > 0) {
      await sql`
        DELETE FROM reader_bookmarks
        WHERE reader_id = ${session.readerId} AND novel_id = ${novelId}
      `;
      return { success: true, bookmarked: false };
    }

    await sql`
      INSERT INTO reader_bookmarks (reader_id, novel_id, chapter_id)
      VALUES (${session.readerId}, ${novelId}, ${chapterId ?? null})
    `;
    return { success: true, bookmarked: true };
  } catch {
    return { success: false, error: "Failed to update bookmark." };
  }
}

export interface BookmarkItem {
  novelId: string;
  chapterId: string | null;
  createdAt: Date;
}

/** Get bookmarks for the current reader. Returns empty array if not authenticated. */
export async function getBookmarks(): Promise<BookmarkItem[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const { rows } = await sql<{ novel_id: string; chapter_id: string | null; created_at: Date }>`
      SELECT novel_id, chapter_id, created_at
      FROM reader_bookmarks
      WHERE reader_id = ${session.readerId}
      ORDER BY created_at DESC
    `;
    return rows.map((r) => ({
      novelId: r.novel_id,
      chapterId: r.chapter_id,
      createdAt: new Date(r.created_at),
    }));
  } catch {
    return [];
  }
}

/** Check if a novel is bookmarked by the current reader. */
export async function isNovelBookmarked(novelId: string): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  try {
    const { rows } = await sql`
      SELECT 1 FROM reader_bookmarks
      WHERE reader_id = ${session.readerId} AND novel_id = ${novelId}
    `;
    return rows.length > 0;
  } catch {
    return false;
  }
}
