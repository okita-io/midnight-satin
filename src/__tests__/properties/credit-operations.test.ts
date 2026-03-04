/**
 * Property 2: Chapter unlock credit invariant
 * Validates: Requirements 4.4, 4.5
 *
 * For any reader and any locked chapter, if the reader's credit balance is >= 5,
 * calling unlockChapter should: (a) decrease the reader's credit balance by exactly 5,
 * (b) create a chapter_unlock record, and (c) create a credit_transaction record of
 * type 'chapter_unlock' with amount -5. If the reader's credit balance is < 5,
 * calling unlockChapter should fail and leave the reader's credit balance unchanged
 * with no new records created.
 *
 * Property 3: Chapter unlock idempotence
 * Validates: Requirements 4.6
 *
 * For any reader and any chapter that has already been unlocked, calling unlockChapter
 * again should not deduct additional credits and should return success, preserving
 * the existing unlock record.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  unlockChapterInStore,
  getReaderBalanceFromStore,
  hasChapterUnlockFromStore,
  countChapterUnlockTransactionsFromStore,
} from "@/lib/db/store";
import type {
  ReaderRow,
  AuthorProfile,
  Novel,
  Chapter,
  ChapterUnlock,
} from "@/lib/db/types";

const UNLOCK_COST = 5;

describe("Property 2: Chapter unlock credit invariant", () => {
  beforeEach(() => clearStore());

  it("when balance >= 5: decreases balance by 5, creates unlock and transaction", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 5, max: 10000 }),
        (readerId, authorId, novelId, chapterId, balance) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: balance,
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
            isFree: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);

          const result = unlockChapterInStore(readerId, chapterId);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.newBalance).toBe(balance - UNLOCK_COST);
          }
          expect(getReaderBalanceFromStore(readerId)).toBe(balance - UNLOCK_COST);
          expect(hasChapterUnlockFromStore(readerId, chapterId)).toBe(true);
          expect(
            countChapterUnlockTransactionsFromStore(readerId, chapterId)
          ).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when balance < 5: fails, leaves balance unchanged, no new records", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 0, max: 4 }),
        (readerId, authorId, novelId, chapterId, balance) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: balance,
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
            isFree: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);

          const result = unlockChapterInStore(readerId, chapterId);

          expect(result.success).toBe(false);
          expect(getReaderBalanceFromStore(readerId)).toBe(balance);
          expect(hasChapterUnlockFromStore(readerId, chapterId)).toBe(false);
          expect(
            countChapterUnlockTransactionsFromStore(readerId, chapterId)
          ).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 3: Chapter unlock idempotence", () => {
  beforeEach(() => clearStore());

  it("when already unlocked: returns success without deducting credits", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 10, max: 10000 }),
        (readerId, authorId, novelId, chapterId, balance) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: balance,
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
            isFree: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const existingUnlock: ChapterUnlock = {
            readerId,
            chapterId,
            unlockedAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);
          storeEntity(existingUnlock);

          const result = unlockChapterInStore(readerId, chapterId);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.newBalance).toBe(balance);
          }
          expect(getReaderBalanceFromStore(readerId)).toBe(balance);
          expect(hasChapterUnlockFromStore(readerId, chapterId)).toBe(true);
          expect(
            countChapterUnlockTransactionsFromStore(readerId, chapterId)
          ).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("second unlock call after first success: idempotent, no extra deduction", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 10, max: 10000 }),
        (readerId, authorId, novelId, chapterId, balance) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: balance,
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
            isFree: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);

          const first = unlockChapterInStore(readerId, chapterId);
          expect(first.success).toBe(true);

          const second = unlockChapterInStore(readerId, chapterId);
          expect(second.success).toBe(true);
          if (first.success && second.success) {
            expect(second.newBalance).toBe(first.newBalance);
          }
          expect(getReaderBalanceFromStore(readerId)).toBe(balance - UNLOCK_COST);
          expect(
            countChapterUnlockTransactionsFromStore(readerId, chapterId)
          ).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
