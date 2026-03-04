/**
 * Property 11: Reading progress round-trip
 * Validates: Requirements 3.7, 16.1, 16.2
 *
 * For any reader and any chapter with any scroll percentage (0-100), saving the
 * reading progress and then retrieving it should return the same scroll percentage
 * value. The last_read_at timestamp should be updated on each save.
 *
 * Property 12: Current reading identification
 * Validates: Requirements 1.2, 16.3
 *
 * For any reader with one or more reading progress records, the "Current Affairs"
 * query should return the novel associated with the reading progress record that
 * has the most recent last_read_at timestamp, along with the correct chapter
 * number and completion percentage.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  getCurrentReadingFromStore,
  getReadingProgressForChapterFromStore,
} from "@/lib/db/store";
import type {
  ReaderRow,
  AuthorProfile,
  Novel,
  Chapter,
  ReadingProgress,
} from "@/lib/db/types";

/** Generator for a coherent test scenario: reader, author, novels, chapters, and reading progress */
const currentReadingScenarioArb = fc
  .tuple(
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.uuid(),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.string({ minLength: 1, maxLength: 200 }),
    fc.integer({ min: 1, max: 100 }),
    fc.integer({ min: 1, max: 100 }),
    fc.integer({ min: 1, max: 100 }),
    fc.integer({ min: 1, max: 100 }),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.string({ minLength: 1, maxLength: 100 }),
    fc.uniqueArray(fc.integer({ min: 1000000000000, max: 2000000000000 }), {
      minLength: 3,
      maxLength: 3,
    }),
    fc.double({ min: 0, max: 100, noNaN: true }),
    fc.double({ min: 0, max: 100, noNaN: true }),
    fc.double({ min: 0, max: 100, noNaN: true })
  )
  .map(
    ([
      readerId,
      authorId,
      novel1Id,
      novel2Id,
      chapter1Id,
      chapter2Id,
      chapter3Id,
      chapter4Id,
      authorName,
      novel1Title,
      novel2Title,
      chapter1Num,
      chapter2Num,
      chapter3Num,
      chapter4Num,
      chapter1Title,
      chapter2Title,
      chapter3Title,
      chapter4Title,
      timestamps,
      scrollPercent1,
      scrollPercent2,
      scrollPercent3,
    ]) => {
      const [t1, t2, t3] = timestamps;
      return {
        readerId,
        authorId,
        novel1Id,
        novel2Id,
        chapter1Id,
        chapter2Id,
        chapter3Id,
        chapter4Id,
        authorName,
        novel1Title,
        novel2Title,
        chapter1Num,
        chapter2Num,
        chapter3Num,
        chapter4Num,
        chapter1Title,
        chapter2Title,
        chapter3Title,
        chapter4Title,
        lastReadAt1: new Date(t1),
        lastReadAt2: new Date(t2),
        lastReadAt3: new Date(t3),
        scrollPercent1,
        scrollPercent2,
        scrollPercent3,
      };
    }
  );

describe("Property 11: Reading progress round-trip", () => {
  beforeEach(() => clearStore());

  it("save and retrieve returns same scroll percentage for any 0-100 value", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.integer({ min: 1, max: 100 }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (
          readerId,
          authorId,
          novelId,
          chapterId,
          authorName,
          novelTitle,
          chapterNumber,
          scrollPercent
        ) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `reader-${readerId}@test.com`,
            passwordHash: "a".repeat(60),
            displayName: "Test Reader",
            creditBalance: 100,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          };
          const author: AuthorProfile = {
            id: authorId,
            name: authorName,
            avatarUrl: null,
            biography: null,
            styleTags: [],
            followerCount: 0,
            createdAt: new Date(),
          };
          const novel: Novel = {
            id: novelId,
            title: novelTitle,
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
            chapterNumber,
            title: "Chapter",
            content: "Content",
            isFree: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const progress: ReadingProgress = {
            readerId,
            chapterId,
            scrollPercent,
            lastReadAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);
          storeEntity(progress);

          const retrieved =
            getReadingProgressForChapterFromStore(readerId, chapterId);
          expect(retrieved).not.toBeNull();
          expect(retrieved).toBeCloseTo(scrollPercent, 10);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("last_read_at is updated on each save (overwrite)", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 100 }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        fc.double({ min: 0, max: 100, noNaN: true }),
        (readerId, authorId, novelId, chapterId, chapterNum, scroll1, scroll2) => {
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
            chapterNumber: chapterNum,
            title: "Ch",
            content: "x",
            isFree: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);

          const t1 = new Date(1000);
          storeEntity({
            readerId,
            chapterId,
            scrollPercent: scroll1,
            lastReadAt: t1,
          } as ReadingProgress);

          const t2 = new Date(2000);
          storeEntity({
            readerId,
            chapterId,
            scrollPercent: scroll2,
            lastReadAt: t2,
          } as ReadingProgress);

          const retrieved =
            getReadingProgressForChapterFromStore(readerId, chapterId);
          expect(retrieved).not.toBeNull();
          expect(retrieved).toBeCloseTo(scroll2, 10);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 12: Current reading identification", () => {
  beforeEach(() => clearStore());

  it("returns the novel from the reading progress with the most recent last_read_at", () => {
    fc.assert(
      fc.property(currentReadingScenarioArb, (s) => {
        const reader: ReaderRow = {
          id: s.readerId,
          email: `reader-${s.readerId}@test.com`,
          passwordHash: "a".repeat(60),
          displayName: "Test Reader",
          creditBalance: 100,
          role: "reader",
          createdAt: new Date(),
          lastLoginAt: null,
        };
        const author: AuthorProfile = {
          id: s.authorId,
          name: s.authorName,
          avatarUrl: null,
          biography: null,
          styleTags: [],
          followerCount: 0,
          createdAt: new Date(),
        };
        const novel1: Novel = {
          id: s.novel1Id,
          title: s.novel1Title,
          seriesId: null,
          authorId: s.authorId,
          coverImageUrl: null,
          synopsis: null,
          genreTags: [],
          rating: 0,
          ratingCount: 0,
          publicationDate: null,
          createdAt: new Date(),
        };
        const novel2: Novel = {
          id: s.novel2Id,
          title: s.novel2Title,
          seriesId: null,
          authorId: s.authorId,
          coverImageUrl: null,
          synopsis: null,
          genreTags: [],
          rating: 0,
          ratingCount: 0,
          publicationDate: null,
          createdAt: new Date(),
        };
        const chapter1: Chapter = {
          id: s.chapter1Id,
          novelId: s.novel1Id,
          chapterNumber: s.chapter1Num,
          title: s.chapter1Title,
          content: "Chapter content",
          isFree: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const chapter2: Chapter = {
          id: s.chapter2Id,
          novelId: s.novel1Id,
          chapterNumber: s.chapter2Num,
          title: s.chapter2Title,
          content: "Chapter content",
          isFree: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const chapter3: Chapter = {
          id: s.chapter3Id,
          novelId: s.novel2Id,
          chapterNumber: s.chapter3Num,
          title: s.chapter3Title,
          content: "Chapter content",
          isFree: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        const chapter4: Chapter = {
          id: s.chapter4Id,
          novelId: s.novel2Id,
          chapterNumber: s.chapter4Num,
          title: s.chapter4Title,
          content: "Chapter content",
          isFree: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const progress1: ReadingProgress = {
          readerId: s.readerId,
          chapterId: s.chapter1Id,
          scrollPercent: s.scrollPercent1,
          lastReadAt: s.lastReadAt1,
        };
        const progress2: ReadingProgress = {
          readerId: s.readerId,
          chapterId: s.chapter3Id,
          scrollPercent: s.scrollPercent2,
          lastReadAt: s.lastReadAt2,
        };
        const progress3: ReadingProgress = {
          readerId: s.readerId,
          chapterId: s.chapter2Id,
          scrollPercent: s.scrollPercent3,
          lastReadAt: s.lastReadAt3,
        };

        storeEntity(reader);
        storeEntity(author);
        storeEntity(novel1);
        storeEntity(novel2);
        storeEntity(chapter1);
        storeEntity(chapter2);
        storeEntity(chapter3);
        storeEntity(chapter4);
        storeEntity(progress1);
        storeEntity(progress2);
        storeEntity(progress3);

        const result = getCurrentReadingFromStore(s.readerId);
        expect(result).not.toBeNull();

        const mostRecent = [progress1, progress2, progress3].reduce((a, b) =>
          a.lastReadAt >= b.lastReadAt ? a : b
        );
        const expectedChapter =
          mostRecent.chapterId === s.chapter1Id
            ? chapter1
            : mostRecent.chapterId === s.chapter2Id
              ? chapter2
              : mostRecent.chapterId === s.chapter3Id
                ? chapter3
                : chapter4;
        const expectedNovel =
          expectedChapter.novelId === s.novel1Id ? novel1 : novel2;

        expect(result!.novelId).toBe(expectedNovel.id);
        expect(result!.novelTitle).toBe(expectedNovel.title);
        expect(result!.authorName).toBe(author.name);
        expect(result!.chapterNumber).toBe(expectedChapter.chapterNumber);
        expect(result!.chapterTitle).toBe(expectedChapter.title);
        expect(result!.scrollPercent).toBe(mostRecent.scrollPercent);
        expect(result!.chapterId).toBe(mostRecent.chapterId);
      }),
      { numRuns: 100 }
    );
  });

  it("returns null when reader has no reading progress", () => {
    fc.assert(
      fc.property(fc.uuid(), (readerId) => {
        const reader: ReaderRow = {
          id: readerId,
          email: `reader-${readerId}@test.com`,
          passwordHash: "a".repeat(60),
          displayName: "Test Reader",
          creditBalance: 100,
          role: "reader",
          createdAt: new Date(),
          lastLoginAt: null,
        };
        storeEntity(reader);

        const result = getCurrentReadingFromStore(readerId);
        expect(result).toBeNull();
      }),
      { numRuns: 50 }
    );
  });
});
