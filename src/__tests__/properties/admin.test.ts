/**
 * Property 24: Admin analytics accuracy
 * Validates: Requirements 13.2, 13.4, 13.7
 *
 * For any set of database records, the admin content overview counts should
 * exactly match the actual row counts for each entity type. The user analytics
 * (total readers, active readers, total credits purchased, total credits spent)
 * should match the values computed from the underlying transaction and reader
 * records.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  getContentOverviewFromStore,
  getUserAnalyticsFromStore,
  grantCreditsForPurchaseInStore,
  unlockChapterInStore,
  endorseCharacterInStore,
} from "@/lib/db/store";
import { CHAPTER_UNLOCK_COST } from "@/lib/vault-constants";
import type {
  AuthorProfile,
  Series,
  Novel,
  Chapter,
  Character,
  ReaderRow,
  ReadingProgress,
  CreditTransaction,
} from "@/lib/db/types";

describe("Property 24: Admin analytics accuracy", () => {
  beforeEach(() => clearStore());

  it("content overview counts match actual entity counts", () => {
    fc.assert(
      fc.property(
        fc
          .tuple(
            fc.integer({ min: 0, max: 20 }),
            fc.integer({ min: 0, max: 20 }),
            fc.integer({ min: 0, max: 20 }),
            fc.integer({ min: 0, max: 50 }),
            fc.integer({ min: 0, max: 50 })
          )
          .filter(
            ([a, s, n, c, ch]) =>
              (s === 0 || a >= 1) &&
              (n === 0 || a >= 1) &&
              (c === 0 || n >= 1) &&
              (ch === 0 || n >= 1)
          ),
        ([authorCount, seriesCount, novelCount, chapterCount, characterCount]) => {
          clearStore();
          const authorIds: string[] = [];
          for (let i = 0; i < authorCount; i++) {
            const id = crypto.randomUUID();
            authorIds.push(id);
            const author: AuthorProfile = {
              id,
              name: `Author ${i}`,
              avatarUrl: null,
              biography: null,
              styleTags: [],
              followerCount: 0,
              createdAt: new Date(),
            };
            storeEntity(author);
          }

          const seriesIds: string[] = [];
          for (let i = 0; i < seriesCount; i++) {
            const id = crypto.randomUUID();
            seriesIds.push(id);
            const authorId = authorIds[i % authorIds.length] ?? crypto.randomUUID();
            const series: Series = {
              id,
              title: `Series ${i}`,
              authorId,
              description: null,
              genreTags: [],
              isComplete: false,
              createdAt: new Date(),
            };
            storeEntity(series);
          }

          const novelIds: string[] = [];
          for (let i = 0; i < novelCount; i++) {
            const id = crypto.randomUUID();
            novelIds.push(id);
            const authorId = authorIds[i % authorIds.length] ?? crypto.randomUUID();
            const seriesId = seriesIds[i % seriesIds.length];
            const novel: Novel = {
              id,
              title: `Novel ${i}`,
              seriesId: seriesId ?? null,
              authorId,
              coverImageUrl: null,
              synopsis: null,
              genreTags: [],
              rating: 0,
              ratingCount: 0,
              publicationDate: null,
              createdAt: new Date(),
            };
            storeEntity(novel);
          }

          for (let i = 0; i < chapterCount; i++) {
            const novelId = novelIds[i % novelIds.length] ?? crypto.randomUUID();
            const chapter: Chapter = {
              id: crypto.randomUUID(),
              novelId,
              chapterNumber: i + 1,
              title: `Chapter ${i}`,
              content: "Content",
              isFree: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            storeEntity(chapter);
          }

          for (let i = 0; i < characterCount; i++) {
            const novelId = novelIds[i % novelIds.length] ?? crypto.randomUUID();
            const character: Character = {
              id: crypto.randomUUID(),
              novelId,
              name: `Character ${i}`,
              roleSubtitle: null,
              portraitUrl: null,
              description: null,
              backstory: null,
              stats: {},
              secrets: [],
              endorsementCount: 0,
              hasTrophy: false,
              createdAt: new Date(),
            };
            storeEntity(character);
          }

          const overview = getContentOverviewFromStore();
          expect(overview.authorCount).toBe(authorCount);
          expect(overview.seriesCount).toBe(seriesCount);
          expect(overview.novelCount).toBe(novelCount);
          expect(overview.chapterCount).toBe(chapterCount);
          expect(overview.characterCount).toBe(characterCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("user analytics: total readers matches reader count", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 30 }),
        (readerCount) => {
          clearStore();
          for (let i = 0; i < readerCount; i++) {
            const reader: ReaderRow = {
              id: crypto.randomUUID(),
              email: `r${i}@test.com`,
              passwordHash: "x".repeat(60),
              displayName: "Test",
              creditBalance: 0,
              role: "reader",
              createdAt: new Date(),
              lastLoginAt: null,
            };
            storeEntity(reader);
          }

          const analytics = getUserAnalyticsFromStore();
          expect(analytics.totalReaders).toBe(readerCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("user analytics: total credits purchased matches purchase transactions", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            readerId: fc.uuid(),
            credits: fc.integer({ min: 1, max: 5000 }),
          }),
          { maxLength: 15 }
        ),
        (purchases) => {
          clearStore();
          const readerIds = new Set(purchases.map((p) => p.readerId));
          let expectedPurchased = 0;

          for (const readerId of readerIds) {
            const reader: ReaderRow = {
              id: readerId,
              email: `${readerId}@test.com`,
              passwordHash: "x".repeat(60),
              displayName: "Test",
              creditBalance: 10000,
              role: "reader",
              createdAt: new Date(),
              lastLoginAt: null,
            };
            storeEntity(reader);
          }

          for (const p of purchases) {
            const result = grantCreditsForPurchaseInStore(p.readerId, p.credits);
            if (result.success) {
              expectedPurchased += p.credits;
            }
          }

          const analytics = getUserAnalyticsFromStore();
          expect(analytics.totalCreditsPurchased).toBe(expectedPurchased);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("user analytics: total credits spent matches unlock and endorsement transactions", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: CHAPTER_UNLOCK_COST, max: 100 }),
        fc.integer({ min: 0, max: 20 }),
        (readerId, authorId, novelId, balance, endorsementCount) => {
          clearStore();
          const reader: ReaderRow = {
            id: readerId,
            email: `${readerId}@test.com`,
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
          const chapterId = crypto.randomUUID();
          const chapter: Chapter = {
            id: chapterId,
            novelId,
            chapterNumber: 1,
            title: "Ch1",
            content: "Content",
            isFree: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const characterId = crypto.randomUUID();
          const character: Character = {
            id: characterId,
            novelId,
            name: "Char",
            roleSubtitle: null,
            portraitUrl: null,
            description: null,
            backstory: null,
            stats: {},
            secrets: [],
            endorsementCount: 0,
            hasTrophy: false,
            createdAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(chapter);
          storeEntity(character);

          let expectedSpent = 0;

          if (balance >= CHAPTER_UNLOCK_COST) {
            const unlockResult = unlockChapterInStore(readerId, chapterId);
            if (unlockResult.success) {
              expectedSpent += CHAPTER_UNLOCK_COST;
            }
          }

          const endorseLimit = Math.min(
            endorsementCount,
            Math.floor(
              (balance - (balance >= CHAPTER_UNLOCK_COST ? CHAPTER_UNLOCK_COST : 0)) /
                1
            )
          );
          for (let i = 0; i < endorseLimit; i++) {
            const result = endorseCharacterInStore(readerId, characterId);
            if (result.success) {
              expectedSpent += 1;
            }
          }

          const analytics = getUserAnalyticsFromStore();
          expect(analytics.totalCreditsSpent).toBe(expectedSpent);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("user analytics: active readers = distinct readers with reading progress in last 7 days", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            readerId: fc.uuid(),
            chapterId: fc.uuid(),
            hasRecentProgress: fc.boolean(),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (progressItems) => {
          clearStore();
          const novel: Novel = {
            id: crypto.randomUUID(),
            title: "Novel",
            seriesId: null,
            authorId: crypto.randomUUID(),
            coverImageUrl: null,
            synopsis: null,
            genreTags: [],
            rating: 0,
            ratingCount: 0,
            publicationDate: null,
            createdAt: new Date(),
          };
          storeEntity(novel);

          const expectedActive = new Set<string>();
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

          for (const p of progressItems) {
            const reader: ReaderRow = {
              id: p.readerId,
              email: `${p.readerId}@test.com`,
              passwordHash: "x",
              displayName: "Test",
              creditBalance: 0,
              role: "reader",
              createdAt: new Date(),
              lastLoginAt: null,
            };
            storeEntity(reader);

            const chapter: Chapter = {
              id: p.chapterId,
              novelId: novel.id,
              chapterNumber: 1,
              title: "Ch",
              content: "x",
              isFree: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            storeEntity(chapter);

            const lastReadAt = p.hasRecentProgress
              ? new Date(sevenDaysAgo + 1000)
              : new Date(sevenDaysAgo - 1000);
            const rp: ReadingProgress = {
              readerId: p.readerId,
              chapterId: p.chapterId,
              scrollPercent: 50,
              lastReadAt,
            };
            storeEntity(rp);

            if (p.hasRecentProgress) {
              expectedActive.add(p.readerId);
            }
          }

          const analytics = getUserAnalyticsFromStore();
          expect(analytics.activeReaders).toBe(expectedActive.size);
        }
      ),
      { numRuns: 100 }
    );
  });
});
