"use server";

/**
 * Comments server actions (Req 19.1-19.10, 19.12).
 * getChapterComments, postComment, editComment, deleteComment, likeComment, unlikeComment.
 * Content max 800 chars validated client and server.
 */

import { getSession } from "@/lib/auth/session";
import { validateCommentContent } from "@/lib/comments/validation";
import {
  getChapterCommentsDb,
  insertCommentDb,
  updateCommentDb,
  deleteCommentDb,
  getCommentByIdDb,
  likeCommentDb,
  unlikeCommentDb,
  type CommentWithAuthorAndLike,
} from "@/lib/db/comments";
import type { Comment, CommentThreadPage } from "@/lib/db/types";

export type GetChapterCommentsResult =
  | { success: true; data: CommentThreadPage & { commentsWithAuthor: CommentWithAuthorAndLike[] } }
  | { success: false; error: string };

export type PostCommentResult =
  | { success: true; comment: Comment }
  | { success: false; error: string };

export type EditCommentResult =
  | { success: true; comment: Comment }
  | { success: false; error: string };

export type DeleteCommentResult =
  | { success: true }
  | { success: false; error: string };

export type LikeCommentResult =
  | { success: true; newLikeCount: number }
  | { success: false; error: string };

/**
 * Get comments for a chapter. Public (guests can view).
 * Returns comments with author display names and liked-by-current-reader flag.
 */
export async function getChapterComments(
  chapterId: string,
  options?: { cursor?: string; limit?: number }
): Promise<GetChapterCommentsResult> {
  try {
    const session = await getSession();
    const result = await getChapterCommentsDb(
      chapterId,
      options,
      session?.readerId ?? null
    );
    return { success: true, data: result };
  } catch (err) {
    console.error("getChapterComments error:", err);
    return { success: false, error: "Failed to load comments." };
  }
}

/**
 * Post a new comment (top-level or reply). Requires authentication.
 * Content max 800 chars; empty/whitespace rejected.
 */
export async function postComment(
  chapterId: string,
  content: string,
  parentCommentId?: string | null
): Promise<PostCommentResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to comment." };
  }

  const validation = validateCommentContent(content);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  try {
    const comment = await insertCommentDb(
      chapterId,
      session.readerId,
      content.trim(),
      parentCommentId ?? null
    );
    return { success: true, comment };
  } catch (err) {
    console.error("postComment error:", err);
    return { success: false, error: "Failed to post comment." };
  }
}

/**
 * Edit own comment. Requires authentication and ownership.
 * Content max 800 chars.
 */
export async function editComment(
  commentId: string,
  content: string
): Promise<EditCommentResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to edit comments." };
  }

  const validation = validateCommentContent(content);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const existing = await getCommentByIdDb(commentId);
  if (!existing) {
    return { success: false, error: "Comment not found." };
  }
  if (existing.readerId !== session.readerId) {
    return { success: false, error: "You can only edit your own comments." };
  }

  try {
    const comment = await updateCommentDb(
      commentId,
      content.trim(),
      session.readerId
    );
    if (!comment) {
      return { success: false, error: "Failed to update comment." };
    }
    return { success: true, comment };
  } catch (err) {
    console.error("editComment error:", err);
    return { success: false, error: "Failed to update comment." };
  }
}

/**
 * Soft-delete own comment. Requires authentication and ownership.
 */
export async function deleteComment(commentId: string): Promise<DeleteCommentResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to delete comments." };
  }

  const existing = await getCommentByIdDb(commentId);
  if (!existing) {
    return { success: false, error: "Comment not found." };
  }
  if (existing.readerId !== session.readerId) {
    return { success: false, error: "You can only delete your own comments." };
  }

  try {
    const deleted = await deleteCommentDb(commentId, session.readerId);
    if (!deleted) {
      return { success: false, error: "Failed to delete comment." };
    }
    return { success: true };
  } catch (err) {
    console.error("deleteComment error:", err);
    return { success: false, error: "Failed to delete comment." };
  }
}

/**
 * Like a comment. Idempotent. Requires authentication.
 * Does not affect credits (Req 19.10).
 */
export async function likeComment(commentId: string): Promise<LikeCommentResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to like comments." };
  }

  try {
    const result = await likeCommentDb(commentId, session.readerId);
    if (!result) {
      return { success: false, error: "Comment not found." };
    }
    return { success: true, newLikeCount: result.newLikeCount };
  } catch (err) {
    console.error("likeComment error:", err);
    return { success: false, error: "Failed to like comment." };
  }
}

/**
 * Unlike a comment. Idempotent. Requires authentication.
 */
export async function unlikeComment(commentId: string): Promise<LikeCommentResult> {
  const session = await getSession();
  if (!session) {
    return { success: false, error: "Please log in to unlike comments." };
  }

  try {
    const result = await unlikeCommentDb(commentId, session.readerId);
    if (!result) {
      return { success: false, error: "Comment not found." };
    }
    return { success: true, newLikeCount: result.newLikeCount };
  } catch (err) {
    console.error("unlikeComment error:", err);
    return { success: false, error: "Failed to unlike comment." };
  }
}
