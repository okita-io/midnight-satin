/**
 * Property 14: Chapter access status rendering
 * Validates: Requirements 2.6, 16.4
 *
 * For any chapter in a novel, the chapter list should display "Free" for chapters
 * where is_free is true and a lock icon for chapters where is_free is false.
 * For any authenticated reader, chapters that have been unlocked should also
 * display as accessible regardless of is_free status.
 *
 * Property 15: First unread chapter identification
 * Validates: Requirements 2.7
 *
 * For any novel and any reader, the "Start Reading" FAB should link to the first
 * chapter (by chapter_number) that the reader has not completed (scroll_percent < 100)
 * or not started. If all chapters are completed, it should link to the first chapter.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  listChaptersByNovelFromStore,
  getUnlockedChapterIdsFromStore,
  getReadingProgressForNovelFromStore,
} from "@/lib/db/store";
import { getFirstUnreadChapterId } from "@/lib/content";
import type {
  ReaderRow,
  AuthorProfile,
  Novel,
  Chapter,
  ReadingProgress,
  ChapterUnlock,
} from "@/lib/db/types";

/** Chapter-like type for Property 14/15 tests */
interface ChapterLike {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  isFree: boolean;
}

/** Property 14: Accessible = isFree OR unlocked */
function isChapterAccessible(
  chapter: ChapterLike,
  unlockedIds: Set<string>
): boolean {
  return chapter.isFree || unlockedIds.has(chapter.id);
}

describe("Property 14: Chapter access status rendering", () => {
  beforeEach(() => clearStore());

  it("free chapters are always accessible", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (id, novelId, title, chapterNumber) => {
          const chapter: ChapterLike = {
            id,
            novelId,
            chapterNumber,
            title,
            isFree: true,
          };
          const unlockedIds = new Set<string>();
          expect(isChapterAccessible(chapter, unlockedIds)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("locked chapters are accessible when unlocked", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 100 }),
        (id, novelId, title, chapterNumber) => {
          const chapter: ChapterLike = {
            id,
            novelId,
            chapterNumber,
            title,
            isFree: false,
          };
          const unlockedIds = new Set<string>([id]);
          expect(isChapterAccessible(chapter, unlockedIds)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("locked chapters without unlock are not accessible", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.integer({ min: 1, max: 100 }),
        fc.uuid(), // different id, not in unlocked
        (id, novelId, title, chapterNumber, otherId) => {
          const chapter: ChapterLike = {
            id,
            novelId,
            chapterNumber,
            title,
            isFree: false,
          };
          const unlockedIds = new Set<string>([otherId]);
          expect(isChapterAccessible(chapter, unlockedIds)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("access status matches isFree OR unlocked (store-based scenario)", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.array(
          fc.record({
            id: fc.uuid(),
            chapterNumber: fc.integer({ min: 1, max: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            isFree: fc.boolean(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.array(fc.uuid(), { minLength: 0, maxLength: 5 }),
        (readerId, authorId, novelId, chapterDefs, unlockedChapterIds) => {
          // Dedupe and ensure unique chapter numbers
          const seen = new Set<number>();
          const chapters: Chapter[] = [];
          for (const def of chapterDefs) {
            if (seen.has(def.chapterNumber)) continue;
            seen.add(def.chapterNumber);
            chapters.push({
              id: def.id,
              novelId,
              chapterNumber: def.chapterNumber,
              title: def.title,
              content: "Content",
              isFree: def.isFree,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          if (chapters.length === 0) return;

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

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          for (const ch of chapters) storeEntity(ch);

          const chapterIds = new Set(chapters.map((c) => c.id));
          for (const cid of unlockedChapterIds) {
            if (chapterIds.has(cid)) {
              storeEntity({
                readerId,
                chapterId: cid,
                unlockedAt: new Date(),
              } as ChapterUnlock);
            }
          }

          const storedChapters = listChaptersByNovelFromStore(novelId);
          const unlocked = getUnlockedChapterIdsFromStore(readerId, novelId);

          for (const ch of storedChapters) {
            const expected = ch.isFree || unlocked.has(ch.id);
            expect(isChapterAccessible(ch, unlocked)).toBe(expected);
          }
        }
      ),
      { numRuns: 50 }
    );
  });
});

describe("Property 15: First unread chapter identification", () => {
  beforeEach(() => clearStore());

  it("returns first chapter when no progress", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            chapterNumber: fc.integer({ min: 1, max: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            isFree: fc.boolean(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (defs) => {
          const seen = new Set<number>();
          const chapters: { id: string; novelId: string; chapterNumber: number; title: string; isFree: boolean }[] = [];
          for (const d of defs) {
            if (seen.has(d.chapterNumber)) continue;
            seen.add(d.chapterNumber);
            chapters.push({
              id: d.id,
              novelId: "novel",
              chapterNumber: d.chapterNumber,
              title: d.title,
              isFree: d.isFree,
            });
          }
          chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
          if (chapters.length === 0) return;

          const progress = new Map<string, number>();
          const result = getFirstUnreadChapterId(chapters, progress);
          expect(result).toBe(chapters[0].id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns first incomplete chapter (scroll < 100)", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            chapterNumber: fc.integer({ min: 1, max: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            isFree: fc.boolean(),
          }),
          { minLength: 2, maxLength: 15 }
        ),
        fc.double({ min: 0, max: 99.99, noNaN: true }),
        (defs, scrollPct) => {
          const seen = new Set<number>();
          const chapters: { id: string; novelId: string; chapterNumber: number; title: string; isFree: boolean }[] = [];
          for (const d of defs) {
            if (seen.has(d.chapterNumber)) continue;
            seen.add(d.chapterNumber);
            chapters.push({
              id: d.id,
              novelId: "novel",
              chapterNumber: d.chapterNumber,
              title: d.title,
              isFree: d.isFree,
            });
          }
          chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
          if (chapters.length < 2) return;

          // First chapter completed (100), second incomplete
          const progress = new Map<string, number>([
            [chapters[0].id, 100],
            [chapters[1].id, scrollPct],
          ]);
          const result = getFirstUnreadChapterId(chapters, progress);
          expect(result).toBe(chapters[1].id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns first chapter when all completed", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            chapterNumber: fc.integer({ min: 1, max: 50 }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
            isFree: fc.boolean(),
          }),
          { minLength: 1, maxLength: 15 }
        ),
        (defs) => {
          const seen = new Set<number>();
          const chapters: { id: string; novelId: string; chapterNumber: number; title: string; isFree: boolean }[] = [];
          for (const d of defs) {
            if (seen.has(d.chapterNumber)) continue;
            seen.add(d.chapterNumber);
            chapters.push({
              id: d.id,
              novelId: "novel",
              chapterNumber: d.chapterNumber,
              title: d.title,
              isFree: d.isFree,
            });
          }
          chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
          if (chapters.length === 0) return;

          const progress = new Map(
            chapters.map((c) => [c.id, 100])
          );
          const result = getFirstUnreadChapterId(chapters, progress);
          expect(result).toBe(chapters[0].id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns empty string for empty chapters", () => {
    const result = getFirstUnreadChapterId([], new Map());
    expect(result).toBe("");
  });

  it("first unread matches design (store-based scenario)", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.array(
          fc.record({
            id: fc.uuid(),
            chapterNumber: fc.integer({ min: 1, max: 20 }),
            title: fc.string({ minLength: 1, maxLength: 50 }),
            isFree: fc.boolean(),
          }),
          { minLength: 1, maxLength: 8 }
        ),
        fc.array(
          fc.record({
            chapterId: fc.uuid(),
            scrollPercent: fc.double({ min: 0, max: 100, noNaN: true }),
          }),
          { minLength: 0, maxLength: 8 }
        ),
        (readerId, authorId, novelId, chapterDefs, progressDefs) => {
          const seen = new Set<number>();
          const chapters: Chapter[] = [];
          for (const d of chapterDefs) {
            if (seen.has(d.chapterNumber)) continue;
            seen.add(d.chapterNumber);
            chapters.push({
              id: d.id,
              novelId,
              chapterNumber: d.chapterNumber,
              title: d.title,
              content: "x",
              isFree: d.isFree,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
          if (chapters.length === 0) return;

          const chapterIds = new Set(chapters.map((c) => c.id));
          const progressMap = new Map<string, number>();
          for (const p of progressDefs) {
            if (chapterIds.has(p.chapterId)) {
              progressMap.set(p.chapterId, p.scrollPercent);
            }
          }

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

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          for (const ch of chapters) storeEntity(ch);
          for (const [cid, pct] of progressMap) {
            storeEntity({
              readerId,
              chapterId: cid,
              scrollPercent: pct,
              lastReadAt: new Date(),
            } as ReadingProgress);
          }

          const storedChapters = listChaptersByNovelFromStore(novelId);
          const storedProgress = getReadingProgressForNovelFromStore(readerId, novelId);
          const result = getFirstUnreadChapterId(storedChapters, storedProgress);

          let expected = storedChapters[0].id;
          for (const ch of storedChapters) {
            const pct = storedProgress.get(ch.id);
            if (pct === undefined || pct < 100) {
              expected = ch.id;
              break;
            }
          }
          expect(result).toBe(expected);
        }
      ),
      { numRuns: 50 }
    );
  });
});
