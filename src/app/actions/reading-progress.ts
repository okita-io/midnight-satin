"use server";

import { sql } from "@/lib/db/postgres";
import { getSession } from "@/lib/auth/session";

export interface ReadingProgressItem {
  readerId: string;
  chapterId: string;
  scrollPercent: number;
  lastReadAt: Date;
}

/**
 * Save reading progress for the current chapter (Req 3.7, 16.1).
 * Requires authentication. Uses upsert to update or insert.
 */
export async function saveReadingProgress(
  chapterId: string,
  scrollPercent: number
): Promise<void> {
  const session = await getSession();
  if (!session) return;

  const clamped = Math.max(0, Math.min(100, scrollPercent));

  try {
    await sql`
      INSERT INTO reading_progress (reader_id, chapter_id, scroll_percent, last_read_at)
      VALUES (${session.readerId}, ${chapterId}, ${clamped}, NOW())
      ON CONFLICT (reader_id, chapter_id)
      DO UPDATE SET scroll_percent = ${clamped}, last_read_at = NOW()
    `;
  } catch {
    // Silently fail - progress save is non-critical
  }
}

/**
 * Get all reading progress for the current reader (Req 16.2, design doc).
 * Returns empty array if not authenticated.
 */
export async function getReadingProgress(): Promise<ReadingProgressItem[]> {
  const session = await getSession();
  if (!session) return [];

  try {
    const { rows } = await sql<{
      reader_id: string;
      chapter_id: string;
      scroll_percent: number;
      last_read_at: Date;
    }>`
      SELECT reader_id, chapter_id, scroll_percent, last_read_at
      FROM reading_progress
      WHERE reader_id = ${session.readerId}
      ORDER BY last_read_at DESC
    `;
    return rows.map((r) => ({
      readerId: r.reader_id,
      chapterId: r.chapter_id,
      scrollPercent: Number(r.scroll_percent),
      lastReadAt: new Date(r.last_read_at),
    }));
  } catch {
    return [];
  }
}

/**
 * Get scroll percent for a specific chapter (for scroll restoration).
 * Returns null if not authenticated or no progress.
 */
export async function getReadingProgressForChapter(
  chapterId: string
): Promise<number | null> {
  const session = await getSession();
  if (!session) return null;

  try {
    const { rows } = await sql<{ scroll_percent: number }>`
      SELECT scroll_percent
      FROM reading_progress
      WHERE reader_id = ${session.readerId} AND chapter_id = ${chapterId}
    `;
    if (rows.length === 0) return null;
    return Number(rows[0].scroll_percent);
  } catch {
    return null;
  }
}
