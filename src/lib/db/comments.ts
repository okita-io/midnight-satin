/**
 * Comments database access layer (Req 19.1-19.10, 19.12).
 * Content length validation (max 800 chars) enforced at DB (CHECK) and application layer.
 */

import { sql } from "@/lib/db/postgres";
import type { Comment, CommentThreadPage } from "./types";

/** DB row shape for comments (from SELECT with reader join) */
interface CommentDbRow {
  id: string;
  chapter_id: string;
  reader_id: string;
  parent_comment_id: string | null;
  content: string;
  like_count: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
  display_name?: string | null;
}

/** Row from INSERT/UPDATE RETURNING (no display_name) */
interface CommentReturnRow {
  id: string;
  chapter_id: string;
  reader_id: string;
  parent_comment_id: string | null;
  content: string;
  like_count: number;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

/** Comment with author display name for UI (Req 19.4) */
export interface CommentWithAuthor extends Comment {
  readerDisplayName: string | null;
}

/** CommentWithAuthor plus likedByCurrentReader for UI */
export interface CommentWithAuthorAndLike extends CommentWithAuthor {
  likedByCurrentReader: boolean;
}

function rowToComment(row: CommentDbRow): CommentWithAuthor {
  return {
    id: row.id,
    chapterId: row.chapter_id,
    readerId: row.reader_id,
    parentCommentId: row.parent_comment_id,
    content: row.content,
    likeCount: Number(row.like_count ?? 0),
    isDeleted: Boolean(row.is_deleted),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    readerDisplayName: row.display_name ?? null,
  };
}

const DEFAULT_LIMIT = 50;

async function getChapterCommentsSimple(
  chapterId: string,
  options?: { cursor?: string; limit?: number },
  currentReaderId?: string | null
): Promise<CommentThreadPage & { commentsWithAuthor: CommentWithAuthorAndLike[] }> {
  const limit = Math.min(options?.limit ?? DEFAULT_LIMIT, 100);

  if (options?.cursor) {
    const { rows: cursorRow } = await sql<{ created_at: Date }>`
      SELECT created_at FROM comments WHERE id = ${options.cursor} AND chapter_id = ${chapterId}
    `;
    const cursorAt = cursorRow[0]?.created_at;
    if (!cursorAt) {
      // Invalid cursor, return first page (same as no-cursor)
      const { rows: firstRows } = await sql<CommentDbRow & { liked: boolean }>`
        SELECT c.id, c.chapter_id, c.reader_id, c.parent_comment_id, c.content,
               c.like_count, c.is_deleted, c.created_at, c.updated_at,
               r.display_name,
               EXISTS (
                 SELECT 1 FROM comment_likes cl
                 WHERE cl.comment_id = c.id AND cl.reader_id = ${currentReaderId ?? ""}
               ) AS liked
        FROM comments c
        JOIN readers r ON r.id = c.reader_id
        WHERE c.chapter_id = ${chapterId}
        ORDER BY c.created_at DESC
        LIMIT ${limit + 1}
      `;
      return buildResult(firstRows, limit, chapterId, currentReaderId);
    }
    const { rows } = await sql<CommentDbRow & { liked: boolean }>`
      SELECT c.id, c.chapter_id, c.reader_id, c.parent_comment_id, c.content,
             c.like_count, c.is_deleted, c.created_at, c.updated_at,
             r.display_name,
             EXISTS (
               SELECT 1 FROM comment_likes cl
               WHERE cl.comment_id = c.id AND cl.reader_id = ${currentReaderId ?? ""}
             ) AS liked
      FROM comments c
      JOIN readers r ON r.id = c.reader_id
      WHERE c.chapter_id = ${chapterId}
        AND (c.created_at, c.id) < (
          SELECT created_at, id FROM comments WHERE id = ${options.cursor} AND chapter_id = ${chapterId}
        )
      ORDER BY c.created_at DESC
      LIMIT ${limit + 1}
    `;
    return buildResult(rows, limit, chapterId, currentReaderId);
  }

  const { rows } = await sql<CommentDbRow & { liked: boolean }>`
    SELECT c.id, c.chapter_id, c.reader_id, c.parent_comment_id, c.content,
           c.like_count, c.is_deleted, c.created_at, c.updated_at,
           r.display_name,
           EXISTS (
             SELECT 1 FROM comment_likes cl
             WHERE cl.comment_id = c.id AND cl.reader_id = ${currentReaderId ?? ""}
           ) AS liked
    FROM comments c
    JOIN readers r ON r.id = c.reader_id
    WHERE c.chapter_id = ${chapterId}
    ORDER BY c.created_at DESC
    LIMIT ${limit + 1}
  `;
  return buildResult(rows, limit, chapterId, currentReaderId);
}

function buildResult(
  rows: (CommentDbRow & { liked: boolean })[],
  limit: number,
  _chapterId: string,
  currentReaderId?: string | null
): CommentThreadPage & { commentsWithAuthor: CommentWithAuthorAndLike[] } {
  const hasMore = rows.length > limit;
  const pageRows = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore && pageRows.length > 0
    ? pageRows[pageRows.length - 1].id
    : null;

  const commentsWithAuthor: CommentWithAuthorAndLike[] = pageRows.map((r) => ({
    ...rowToComment(r),
    likedByCurrentReader: Boolean(r.liked && currentReaderId),
  }));

  const comments: Comment[] = commentsWithAuthor.map((c) => ({
    id: c.id,
    chapterId: c.chapterId,
    readerId: c.readerId,
    parentCommentId: c.parentCommentId,
    content: c.isDeleted ? "" : c.content,
    likeCount: c.likeCount,
    isDeleted: c.isDeleted,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  // Also scrub deleted bodies on the author-enriched list used by the UI.
  const scrubbedWithAuthor = commentsWithAuthor.map((c) =>
    c.isDeleted ? { ...c, content: "" } : c
  );

  return {
    comments,
    nextCursor,
    commentsWithAuthor: scrubbedWithAuthor,
  };
}

/** Get total comment count for a chapter (for badge display). */
export async function getChapterCommentCountDb(chapterId: string): Promise<number> {
  const { rows } = await sql<{ count: string }>`
    SELECT COUNT(*)::text AS count FROM comments WHERE chapter_id = ${chapterId}
  `;
  return parseInt(rows[0]?.count ?? "0", 10);
}

/** Get chapter comments - exported as main data layer function */
export async function getChapterCommentsDb(
  chapterId: string,
  options?: { cursor?: string; limit?: number },
  currentReaderId?: string | null
): Promise<CommentThreadPage & { commentsWithAuthor: CommentWithAuthorAndLike[] }> {
  return getChapterCommentsSimple(chapterId, options, currentReaderId);
}

/** Insert a new comment. Returns the created comment. */
export async function insertCommentDb(
  chapterId: string,
  readerId: string,
  content: string,
  parentCommentId?: string | null
): Promise<Comment> {
  const { rows } = await sql<CommentReturnRow>`
    INSERT INTO comments (chapter_id, reader_id, content, parent_comment_id)
    VALUES (${chapterId}, ${readerId}, ${content}, ${parentCommentId ?? null})
    RETURNING id, chapter_id, reader_id, parent_comment_id, content, like_count, is_deleted, created_at, updated_at
  `;
  const r = rows[0];
  if (!r) throw new Error("Failed to insert comment");
  return {
    id: r.id,
    chapterId: r.chapter_id,
    readerId: r.reader_id,
    parentCommentId: r.parent_comment_id,
    content: r.content,
    likeCount: Number(r.like_count ?? 0),
    isDeleted: Boolean(r.is_deleted),
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

/** Update comment content. Returns updated comment or null if not found. */
export async function updateCommentDb(
  commentId: string,
  content: string,
  readerId: string
): Promise<Comment | null> {
  const { rows } = await sql<CommentReturnRow>`
    UPDATE comments
    SET content = ${content}, updated_at = NOW()
    WHERE id = ${commentId} AND reader_id = ${readerId}
    RETURNING id, chapter_id, reader_id, parent_comment_id, content, like_count, is_deleted, created_at, updated_at
  `;
  const r = rows[0];
  if (!r) return null;
  return {
    id: r.id,
    chapterId: r.chapter_id,
    readerId: r.reader_id,
    parentCommentId: r.parent_comment_id,
    content: r.content,
    likeCount: Number(r.like_count ?? 0),
    isDeleted: Boolean(r.is_deleted),
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

/** Soft-delete a comment (set is_deleted = true). Returns true if updated. */
export async function deleteCommentDb(
  commentId: string,
  readerId: string
): Promise<boolean> {
  const { rowCount } = await sql`
    UPDATE comments
    SET is_deleted = true, updated_at = NOW()
    WHERE id = ${commentId} AND reader_id = ${readerId}
  `;
  return (rowCount ?? 0) > 0;
}

/** Get comment by id (for ownership check). */
export async function getCommentByIdDb(commentId: string): Promise<{
  id: string;
  readerId: string;
  chapterId: string;
} | null> {
  const { rows } = await sql<{ id: string; reader_id: string; chapter_id: string }>`
    SELECT id, reader_id, chapter_id FROM comments WHERE id = ${commentId}
  `;
  const r = rows[0];
  if (!r) return null;
  return { id: r.id, readerId: r.reader_id, chapterId: r.chapter_id };
}

/** Like a comment. Idempotent. Returns new like count. */
export async function likeCommentDb(
  commentId: string,
  readerId: string
): Promise<{ newLikeCount: number } | null> {
  const client = await sql.connect();
  try {
    await client.sql`BEGIN`;

    // Insert like; increment like_count only if we actually inserted (idempotent)
    await client.sql`
      WITH ins AS (
        INSERT INTO comment_likes (reader_id, comment_id)
        VALUES (${readerId}, ${commentId})
        ON CONFLICT (reader_id, comment_id) DO NOTHING
        RETURNING 1
      )
      UPDATE comments
      SET like_count = like_count + (SELECT COALESCE(COUNT(*), 0) FROM ins)
      WHERE id = ${commentId}
    `;

    const { rows } = await client.sql<{ like_count: number }>`
      SELECT like_count FROM comments WHERE id = ${commentId}
    `;
    await client.sql`COMMIT`;
    const newLikeCount = Number(rows[0]?.like_count ?? 0);
    return { newLikeCount };
  } catch (err) {
    try {
      await client.sql`ROLLBACK`;
    } catch {
      /* ignore */
    }
    throw err;
  } finally {
    client.release();
  }
}

/** Unlike a comment. Returns new like count. */
export async function unlikeCommentDb(
  commentId: string,
  readerId: string
): Promise<{ newLikeCount: number } | null> {
  const { rowCount } = await sql`
    DELETE FROM comment_likes
    WHERE reader_id = ${readerId} AND comment_id = ${commentId}
  `;
  if ((rowCount ?? 0) === 0) {
    // No like to remove - return current count (idempotent)
    const { rows } = await sql<{ like_count: number }>`
      SELECT like_count FROM comments WHERE id = ${commentId}
    `;
    return { newLikeCount: Number(rows[0]?.like_count ?? 0) };
  }
  await sql`
    UPDATE comments SET like_count = GREATEST(0, like_count - 1) WHERE id = ${commentId}
  `;
  const { rows } = await sql<{ like_count: number }>`
    SELECT like_count FROM comments WHERE id = ${commentId}
  `;
  return { newLikeCount: Number(rows[0]?.like_count ?? 0) };
}
