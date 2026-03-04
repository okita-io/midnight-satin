/**
 * Property 25: Comment lifecycle and ownership
 * Validates: Requirements 19.5, 19.6
 *
 * For any reader and any chapter, creating a comment should associate the comment
 * with that reader and chapter, set is_deleted to false, and persist the content text.
 * Only the comment's author (or an admin) may edit or delete the comment.
 * Deleting a comment should set is_deleted to true, optionally replace the content
 * with a fixed placeholder, and leave existing like counts and comment_likes records intact.
 *
 * Property 26: Comment like invariant
 * Validates: Requirements 19.7
 *
 * For any reader and any comment, if no comment_likes record exists for that
 * reader/comment pair, calling likeComment should create exactly one record and
 * increment the comment's like_count by 1. Calling likeComment again without an
 * intervening unlikeComment should be idempotent (no extra record, no additional increment).
 * Calling unlikeComment should remove the record (if present) and decrement like_count
 * by 1 without going below 0.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  postCommentInStore,
  editCommentInStore,
  deleteCommentInStore,
  likeCommentInStore,
  unlikeCommentInStore,
  getCommentFromStore,
  hasCommentLikeFromStore,
  countCommentLikesFromStore,
} from "@/lib/db/store";
import type {
  ReaderRow,
  AuthorProfile,
  Novel,
  Chapter,
  Comment,
} from "@/lib/db/types";

const MAX_COMMENT_LENGTH = 800;

function seedStore(readerId: string, authorId: string, novelId: string, chapterId: string) {
  const reader: ReaderRow = {
    id: readerId,
    email: `r-${readerId}@test.com`,
    passwordHash: "x".repeat(60),
    displayName: "Test",
    creditBalance: 100,
    role: "reader",
    createdAt: new Date(),
    lastLoginAt: null,
  };
  const author: AuthorProfile = {
    id: authorId,
    name: "Author",
    avatarUrl: null,
    biography: null,
    styleTags: [],
    followerCount: 0,
    createdAt: new Date(),
  };
  const novel: Novel = {
    id: novelId,
    title: "Novel",
    seriesId: null,
    authorId,
    coverImageUrl: null,
    synopsis: null,
    genreTags: [],
    rating: 0,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
  };
  const chapter: Chapter = {
    id: chapterId,
    novelId,
    chapterNumber: 1,
    title: "Chapter 1",
    content: "Content",
    isFree: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  storeEntity(reader);
  storeEntity(author);
  storeEntity(novel);
  storeEntity(chapter);
}

describe("Property 25: Comment lifecycle and ownership", () => {
  beforeEach(() => clearStore());

  it("creating a comment associates with reader and chapter, is_deleted false, persists content", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: MAX_COMMENT_LENGTH }).filter((s) => s.trim().length > 0),
        (readerId, authorId, novelId, chapterId, content) => {
          seedStore(readerId, authorId, novelId, chapterId);

          const result = postCommentInStore(chapterId, readerId, content);

          expect(result.success).toBe(true);
          if (result.success) {
            const c = result.comment;
            expect(c.chapterId).toBe(chapterId);
            expect(c.readerId).toBe(readerId);
            expect(c.isDeleted).toBe(false);
            expect(c.content).toBe(content.trim());
            expect(c.likeCount).toBe(0);
          }

          const stored = getCommentFromStore((result as { success: true; comment: Comment }).comment.id);
          expect(stored).not.toBeNull();
          expect(stored?.chapterId).toBe(chapterId);
          expect(stored?.readerId).toBe(readerId);
          expect(stored?.isDeleted).toBe(false);
          expect(stored?.content).toBe(content.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it("only author may edit comment", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, otherReaderId, novelId, chapterId, originalContent, newContent) => {
          fc.pre(readerId !== otherReaderId);
          seedStore(readerId, authorId, novelId, chapterId);

          const postResult = postCommentInStore(chapterId, readerId, originalContent);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;

          const editByAuthor = editCommentInStore(commentId, newContent, readerId);
          expect(editByAuthor.success).toBe(true);
          if (editByAuthor.success) {
            expect(editByAuthor.comment.content).toBe(newContent.trim());
          }

          storeEntity({
            id: otherReaderId,
            email: `other-${otherReaderId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Other",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const editByOther = editCommentInStore(commentId, "hacked", otherReaderId);
          expect(editByOther.success).toBe(false);
          expect(editByOther).toMatchObject({ success: false, error: expect.stringContaining("author") });

          const stored = getCommentFromStore(commentId);
          expect(stored?.content).toBe(newContent.trim());
        }
      ),
      { numRuns: 100 }
    );
  });

  it("only author may delete comment", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, otherReaderId, novelId, chapterId, content) => {
          fc.pre(readerId !== otherReaderId);
          seedStore(readerId, authorId, novelId, chapterId);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;

          const deleteByOther = deleteCommentInStore(commentId, otherReaderId);
          expect(deleteByOther.success).toBe(false);

          const storedBefore = getCommentFromStore(commentId);
          expect(storedBefore?.isDeleted).toBe(false);

          const deleteByAuthor = deleteCommentInStore(commentId, readerId);
          expect(deleteByAuthor.success).toBe(true);

          const storedAfter = getCommentFromStore(commentId);
          expect(storedAfter?.isDeleted).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("deleting comment sets is_deleted true, leaves like counts and comment_likes intact", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, likerId, novelId, chapterId, content) => {
          fc.pre(readerId !== likerId);
          seedStore(readerId, authorId, novelId, chapterId);
          storeEntity({
            id: likerId,
            email: `liker-${likerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Liker",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;

          const likeResult = likeCommentInStore(commentId, likerId);
          expect(likeResult.success).toBe(true);
          if (!likeResult.success) return;
          const likeCountBefore = likeResult.newLikeCount;
          expect(likeCountBefore).toBe(1);
          expect(hasCommentLikeFromStore(likerId, commentId)).toBe(true);
          expect(countCommentLikesFromStore(commentId)).toBe(1);

          const deleteResult = deleteCommentInStore(commentId, readerId);
          expect(deleteResult.success).toBe(true);

          const stored = getCommentFromStore(commentId);
          expect(stored?.isDeleted).toBe(true);
          expect(stored?.likeCount).toBe(likeCountBefore);
          expect(hasCommentLikeFromStore(likerId, commentId)).toBe(true);
          expect(countCommentLikesFromStore(commentId)).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 26: Comment like invariant", () => {
  beforeEach(() => clearStore());

  it("likeComment creates one record and increments like_count by 1 when no like exists", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, likerId, novelId, chapterId, content) => {
          fc.pre(readerId !== likerId);
          seedStore(readerId, authorId, novelId, chapterId);
          storeEntity({
            id: likerId,
            email: `liker-${likerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Liker",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;
          expect(postResult.comment.likeCount).toBe(0);

          const likeResult = likeCommentInStore(commentId, likerId);

          expect(likeResult.success).toBe(true);
          if (likeResult.success) {
            expect(likeResult.newLikeCount).toBe(1);
          }
          expect(hasCommentLikeFromStore(likerId, commentId)).toBe(true);
          expect(countCommentLikesFromStore(commentId)).toBe(1);
          const stored = getCommentFromStore(commentId);
          expect(stored?.likeCount).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("likeComment is idempotent when already liked", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, likerId, novelId, chapterId, content) => {
          fc.pre(readerId !== likerId);
          seedStore(readerId, authorId, novelId, chapterId);
          storeEntity({
            id: likerId,
            email: `liker-${likerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Liker",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;

          const first = likeCommentInStore(commentId, likerId);
          expect(first.success).toBe(true);
          if (!first.success) return;
          const countAfterFirst = first.newLikeCount;

          const second = likeCommentInStore(commentId, likerId);
          expect(second.success).toBe(true);
          if (second.success) {
            expect(second.newLikeCount).toBe(countAfterFirst);
          }
          expect(countCommentLikesFromStore(commentId)).toBe(1);
          expect(getCommentFromStore(commentId)?.likeCount).toBe(countAfterFirst);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("unlikeComment removes record and decrements like_count by 1", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, likerId, novelId, chapterId, content) => {
          fc.pre(readerId !== likerId);
          seedStore(readerId, authorId, novelId, chapterId);
          storeEntity({
            id: likerId,
            email: `liker-${likerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Liker",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;

          likeCommentInStore(commentId, likerId);
          expect(hasCommentLikeFromStore(likerId, commentId)).toBe(true);
          expect(getCommentFromStore(commentId)?.likeCount).toBe(1);

          const unlikeResult = unlikeCommentInStore(commentId, likerId);
          expect(unlikeResult.success).toBe(true);
          if (unlikeResult.success) {
            expect(unlikeResult.newLikeCount).toBe(0);
          }
          expect(hasCommentLikeFromStore(likerId, commentId)).toBe(false);
          expect(countCommentLikesFromStore(commentId)).toBe(0);
          expect(getCommentFromStore(commentId)?.likeCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("unlikeComment when not liked is idempotent, like_count unchanged", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, likerId, novelId, chapterId, content) => {
          fc.pre(readerId !== likerId);
          seedStore(readerId, authorId, novelId, chapterId);
          storeEntity({
            id: likerId,
            email: `liker-${likerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Liker",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;
          expect(hasCommentLikeFromStore(likerId, commentId)).toBe(false);

          const unlikeResult = unlikeCommentInStore(commentId, likerId);
          expect(unlikeResult.success).toBe(true);
          if (unlikeResult.success) {
            expect(unlikeResult.newLikeCount).toBe(0);
          }
          expect(getCommentFromStore(commentId)?.likeCount).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("like_count never goes below 0", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }).filter((s) => s.trim().length > 0),
        (authorId, readerId, likerId, novelId, chapterId, content) => {
          fc.pre(readerId !== likerId);
          seedStore(readerId, authorId, novelId, chapterId);
          storeEntity({
            id: likerId,
            email: `liker-${likerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Liker",
            creditBalance: 0,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          } as ReaderRow);

          const postResult = postCommentInStore(chapterId, readerId, content);
          expect(postResult.success).toBe(true);
          if (!postResult.success) return;
          const commentId = postResult.comment.id;

          likeCommentInStore(commentId, likerId);
          unlikeCommentInStore(commentId, likerId);
          const afterOneCycle = getCommentFromStore(commentId)?.likeCount ?? -1;
          expect(afterOneCycle).toBe(0);

          unlikeCommentInStore(commentId, likerId);
          unlikeCommentInStore(commentId, likerId);
          const afterExtraUnlikes = getCommentFromStore(commentId)?.likeCount ?? -1;
          expect(afterExtraUnlikes).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
