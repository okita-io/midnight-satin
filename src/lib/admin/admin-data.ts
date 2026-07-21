/**
 * Admin Dashboard Data Layer
 * Content overview, user analytics, readers list, credit adjustment, comment moderation.
 * Requirements: 13.1-13.7
 */

import { sql } from "@/lib/db/postgres";
import type { Reader, ReaderDbRow } from "@/lib/db/types";
import { readerDbRowToReader } from "@/lib/db/types";
import {
  listContent,
  createAuthor,
  createSeries,
  createNovel,
  createChapter,
  createCharacter,
  updateContent,
  type CreateAuthorParams,
  type CreateSeriesParams,
  type CreateNovelParams,
  type CreateChapterParams,
  type CreateCharacterParams,
  type ListContentParams,
  type UpdateContentParams,
} from "@/lib/mcp/mcp-data";

/** Content overview stats (Req 13.2) */
export interface ContentStats {
  authors: number;
  series: number;
  novels: number;
  chapters: number;
  characters: number;
}

/** User analytics (Req 13.4) */
export interface UserAnalytics {
  totalReaders: number;
  activeReaders7d: number;
  totalCreditsPurchased: number;
  totalCreditsSpent: number;
}

/** Comment with reader display name for moderation */
export interface CommentWithReader {
  id: string;
  chapterId: string;
  readerId: string;
  readerDisplayName: string | null;
  readerEmail: string;
  content: string;
  likeCount: number;
  isDeleted: boolean;
  createdAt: Date;
  novelTitle?: string;
  chapterTitle?: string;
}

/** Get content overview counts (Req 13.2) */
export async function getContentOverview(): Promise<ContentStats> {
  const [authorsRes, seriesRes, novelsRes, chaptersRes, charactersRes] = await Promise.all([
    sql`SELECT COUNT(*)::int AS c FROM author_profiles`,
    sql`SELECT COUNT(*)::int AS c FROM series`,
    sql`SELECT COUNT(*)::int AS c FROM novels`,
    sql`SELECT COUNT(*)::int AS c FROM chapters`,
    sql`SELECT COUNT(*)::int AS c FROM characters`,
  ]);
  return {
    authors: Number(authorsRes.rows[0]?.c ?? 0),
    series: Number(seriesRes.rows[0]?.c ?? 0),
    novels: Number(novelsRes.rows[0]?.c ?? 0),
    chapters: Number(chaptersRes.rows[0]?.c ?? 0),
    characters: Number(charactersRes.rows[0]?.c ?? 0),
  };
}

/** Get user analytics (Req 13.4) */
export async function getUserAnalytics(): Promise<UserAnalytics> {
  const [readersRes, activeRes, purchasedRes, spentRes] = await Promise.all([
    sql`SELECT COUNT(*)::int AS c FROM readers`,
    sql`
      SELECT COUNT(DISTINCT rp.reader_id)::int AS c
      FROM reading_progress rp
      WHERE rp.last_read_at >= NOW() - INTERVAL '7 days'
    `,
    sql`
      SELECT COALESCE(SUM(amount), 0)::int AS c
      FROM credit_transactions
      WHERE transaction_type = 'purchase'
    `,
    sql`
      SELECT COALESCE(ABS(SUM(amount)), 0)::int AS c
      FROM credit_transactions
      WHERE transaction_type IN ('chapter_unlock', 'endorsement')
    `,
  ]);
  return {
    totalReaders: Number(readersRes.rows[0]?.c ?? 0),
    activeReaders7d: Number(activeRes.rows[0]?.c ?? 0),
    totalCreditsPurchased: Number(purchasedRes.rows[0]?.c ?? 0),
    totalCreditsSpent: Number(spentRes.rows[0]?.c ?? 0),
  };
}

/** List readers with optional filters (Req 13.5) */
export async function getReaders(options?: {
  email?: string;
  limit?: number;
  offset?: number;
}): Promise<Reader[]> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;
  if (options?.email?.trim()) {
    const pattern = `%${options.email.trim().toLowerCase()}%`;
    const { rows } = await sql<ReaderDbRow>`
      SELECT id, email, password_hash, display_name, credit_balance, role, created_at, last_login_at
      FROM readers
      WHERE LOWER(email) LIKE ${pattern}
      ORDER BY created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;
    return rows.map(readerDbRowToReader);
  }
  const { rows } = await sql<ReaderDbRow>`
    SELECT id, email, password_hash, display_name, credit_balance, role, created_at, last_login_at
    FROM readers
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  return rows.map(readerDbRowToReader);
}

/** Adjust reader credits (Req 13.6, Property 23) */
export async function adjustUserCredits(
  readerId: string,
  amount: number,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    void reason; // TODO: persist to audit log when schema supports it
    const { rowCount } = await sql`
      UPDATE readers
      SET credit_balance = credit_balance + ${amount}
      WHERE id = ${readerId}
    `;
    if (rowCount === 0) return { success: false, error: "Reader not found" };
    await sql`
      INSERT INTO credit_transactions (reader_id, amount, transaction_type, related_entity_id)
      VALUES (${readerId}, ${amount}, 'admin_adjustment', NULL)
    `;
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to adjust credits",
    };
  }
}

/** Soft-delete (hide) a comment (Req 19.11) */
export async function hideComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { rowCount } = await sql`
      UPDATE comments SET is_deleted = true, updated_at = NOW() WHERE id = ${commentId}
    `;
    return rowCount ? { success: true } : { success: false, error: "Comment not found" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to hide comment",
    };
  }
}

/** Restore a soft-deleted comment */
export async function restoreComment(commentId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { rowCount } = await sql`
      UPDATE comments SET is_deleted = false, updated_at = NOW() WHERE id = ${commentId}
    `;
    return rowCount ? { success: true } : { success: false, error: "Comment not found" };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to restore comment",
    };
  }
}

/** List comments for moderation with reader info */
export async function getCommentsForModeration(options?: {
  includeDeleted?: boolean;
  limit?: number;
}): Promise<CommentWithReader[]> {
  const limit = options?.limit ?? 100;
  const includeDeleted = options?.includeDeleted ?? false;
  type CommentRow = {
    id: string;
    chapter_id: string;
    reader_id: string;
    content: string;
    like_count: number;
    is_deleted: boolean;
    created_at: Date;
    display_name: string | null;
    email: string;
    novel_title: string;
    chapter_title: string;
  };
  const { rows } = includeDeleted
    ? await sql<CommentRow>`
        SELECT c.id, c.chapter_id, c.reader_id, c.content, c.like_count, c.is_deleted, c.created_at,
               r.display_name, r.email,
               n.title AS novel_title, ch.title AS chapter_title
        FROM comments c
        JOIN readers r ON r.id = c.reader_id
        JOIN chapters ch ON ch.id = c.chapter_id
        JOIN novels n ON n.id = ch.novel_id
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `
    : await sql<CommentRow>`
        SELECT c.id, c.chapter_id, c.reader_id, c.content, c.like_count, c.is_deleted, c.created_at,
               r.display_name, r.email,
               n.title AS novel_title, ch.title AS chapter_title
        FROM comments c
        JOIN readers r ON r.id = c.reader_id
        JOIN chapters ch ON ch.id = c.chapter_id
        JOIN novels n ON n.id = ch.novel_id
        WHERE c.is_deleted = false
        ORDER BY c.created_at DESC
        LIMIT ${limit}
      `;
  return rows.map((r) => ({
    id: r.id,
    chapterId: r.chapter_id,
    readerId: r.reader_id,
    readerDisplayName: r.display_name,
    readerEmail: r.email,
    content: r.content,
    likeCount: Number(r.like_count),
    isDeleted: Boolean(r.is_deleted),
    createdAt: new Date(r.created_at),
    novelTitle: r.novel_title,
    chapterTitle: r.chapter_title,
  }));
}

// Re-export MCP data functions for admin CRUD
export {
  listContent,
  createAuthor,
  createSeries,
  createNovel,
  createChapter,
  createCharacter,
  updateContent,
  type CreateAuthorParams,
  type CreateSeriesParams,
  type CreateNovelParams,
  type CreateChapterParams,
  type CreateCharacterParams,
  type ListContentParams,
  type UpdateContentParams,
};
