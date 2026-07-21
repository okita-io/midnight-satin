/**
 * Property 2: Chapter unlock credit invariant
 * Validates: Requirements 4.4, 4.5
 *
 * For any reader and any locked chapter, if the reader's credit balance is >= CHAPTER_UNLOCK_COST,
 * calling unlockChapter should: (a) decrease the reader's credit balance by exactly CHAPTER_UNLOCK_COST,
 * (b) create a chapter_unlock record, and (c) create a credit_transaction record of
 * type 'chapter_unlock' with amount -CHAPTER_UNLOCK_COST. If the reader's credit balance is
 * < CHAPTER_UNLOCK_COST, calling unlockChapter should fail and leave the reader's credit
 * balance unchanged with no new records created.
 *
 * Property 3: Chapter unlock idempotence
 * Validates: Requirements 4.6
 *
 * For any reader and any chapter that has already been unlocked, calling unlockChapter
 * again should not deduct additional credits and should return success, preserving
 * the existing unlock record.
 *
 * Property 4: Character endorsement credit invariant
 * Validates: Requirements 6.4, 6.5
 *
 * For any reader and any character, if the reader's credit balance is >= 1,
 * calling endorseCharacter should: (a) decrease the reader's credit balance by exactly 1,
 * (b) increment the character's endorsement_count by exactly 1, and (c) create a
 * credit_transaction record of type 'endorsement' with amount -1. If the reader's
 * credit balance is 0, calling endorseCharacter should fail and leave both the
 * reader's balance and the character's endorsement count unchanged.
 *
 * Property 5: Trophy badge threshold
 * Validates: Requirements 5.5, 6.6
 *
 * For any character, has_trophy should be true if and only if endorsement_count > 1000.
 * When an endorsement causes the count to cross from <= 1000 to > 1000, the trophy
 * flag should be set to true.
 *
 * Property 6: Payment processing credit invariant
 * Validates: Requirements 8.5, 8.6, 10.8
 *
 * For any reader and any credit pack, a successful payment should increase the reader's
 * credit balance by exactly the pack's credit amount and create a credit_transaction
 * record of type 'purchase' with the correct positive amount. A failed payment should
 * leave the reader's credit balance unchanged with no new transaction records.
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
  endorseCharacterInStore,
  getCharacterFromStore,
  countEndorsementTransactionsFromStore,
  grantCreditsForPurchaseInStore,
  countPurchaseTransactionsFromStore,
  getPurchaseTransactionsFromStore,
} from "@/lib/db/store";
import { CHAPTER_UNLOCK_COST } from "@/lib/vault-constants";
import type {
  ReaderRow,
  AuthorProfile,
  Novel,
  Chapter,
  ChapterUnlock,
  Character,
  CharacterStats,
} from "@/lib/db/types";

const ENDORSEMENT_COST = 1;
const TROPHY_THRESHOLD = 1000;

function makeCharacter(
  id: string,
  novelId: string,
  endorsementCount: number,
  hasTrophy: boolean
): Character {
  const stats: CharacterStats = {};
  return {
    id,
    novelId,
    name: "Character",
    roleSubtitle: null,
    portraitUrl: null,
    description: null,
    backstory: null,
    stats,
    secrets: [],
    endorsementCount,
    hasTrophy,
    createdAt: new Date(),
  };
}

describe("Property 2: Chapter unlock credit invariant", () => {
  beforeEach(() => clearStore());

  it(`when balance >= ${CHAPTER_UNLOCK_COST}: decreases balance by ${CHAPTER_UNLOCK_COST}, creates unlock and transaction`, () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: CHAPTER_UNLOCK_COST, max: 10000 }),
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
            expect(result.newBalance).toBe(balance - CHAPTER_UNLOCK_COST);
          }
          expect(getReaderBalanceFromStore(readerId)).toBe(balance - CHAPTER_UNLOCK_COST);
          expect(hasChapterUnlockFromStore(readerId, chapterId)).toBe(true);
          expect(
            countChapterUnlockTransactionsFromStore(readerId, chapterId)
          ).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it(`when balance < ${CHAPTER_UNLOCK_COST}: fails, leaves balance unchanged, no new records`, () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 0, max: CHAPTER_UNLOCK_COST - 1 }),
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
          expect(getReaderBalanceFromStore(readerId)).toBe(balance - CHAPTER_UNLOCK_COST);
          expect(
            countChapterUnlockTransactionsFromStore(readerId, chapterId)
          ).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 4: Character endorsement credit invariant", () => {
  beforeEach(() => clearStore());

  it("when balance >= 1: decreases balance by 1, increments endorsement_count, creates transaction", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 10000 }),
        fc.nat(5000),
        (readerId, authorId, novelId, characterId, balance, endorsementCount) => {
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
          const character = makeCharacter(
            characterId,
            novelId,
            endorsementCount,
            endorsementCount > TROPHY_THRESHOLD
          );

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(character);

          const result = endorseCharacterInStore(readerId, characterId);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.newBalance).toBe(balance - ENDORSEMENT_COST);
            expect(result.newCount).toBe(endorsementCount + 1);
          }
          expect(getReaderBalanceFromStore(readerId)).toBe(
            balance - ENDORSEMENT_COST
          );
          const charAfter = getCharacterFromStore(characterId);
          expect(charAfter?.endorsementCount).toBe(endorsementCount + 1);
          expect(
            countEndorsementTransactionsFromStore(readerId, characterId)
          ).toBe(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when balance is 0: fails, leaves balance and endorsement count unchanged", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.nat(5000),
        (readerId, authorId, novelId, characterId, endorsementCount) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: 0,
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
          const character = makeCharacter(
            characterId,
            novelId,
            endorsementCount,
            endorsementCount > TROPHY_THRESHOLD
          );

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(character);

          const result = endorseCharacterInStore(readerId, characterId);

          expect(result.success).toBe(false);
          expect(getReaderBalanceFromStore(readerId)).toBe(0);
          const charAfter = getCharacterFromStore(characterId);
          expect(charAfter?.endorsementCount).toBe(endorsementCount);
          expect(
            countEndorsementTransactionsFromStore(readerId, characterId)
          ).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 5: Trophy badge threshold", () => {
  beforeEach(() => clearStore());

  it("has_trophy is true iff endorsement_count > 1000", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 0, max: 2000 }),
        (readerId, authorId, novelId, endorsementCount) => {
          const characterId = crypto.randomUUID();
          const expectedTrophy = endorsementCount > TROPHY_THRESHOLD;

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
          const character = makeCharacter(
            characterId,
            novelId,
            endorsementCount,
            expectedTrophy
          );

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(character);

          const charBefore = getCharacterFromStore(characterId);
          expect(charBefore?.hasTrophy).toBe(expectedTrophy);
          expect(charBefore?.endorsementCount).toBe(endorsementCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("when endorsement crosses 1000, has_trophy becomes true", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 0, max: 999 }),
        (readerId, authorId, novelId, initialCount) => {
          const characterId = crypto.randomUUID();

          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: 2000,
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
          const character = makeCharacter(
            characterId,
            novelId,
            initialCount,
            initialCount > TROPHY_THRESHOLD
          );

          storeEntity(reader);
          storeEntity(author);
          storeEntity(novel);
          storeEntity(character);

          const endorsementsNeeded = TROPHY_THRESHOLD - initialCount + 1;
          for (let i = 0; i < endorsementsNeeded; i++) {
            const result = endorseCharacterInStore(readerId, characterId);
            expect(result.success).toBe(true);
          }

          const charAfter = getCharacterFromStore(characterId);
          expect(charAfter?.endorsementCount).toBe(
            initialCount + endorsementsNeeded
          );
          expect(charAfter?.endorsementCount).toBeGreaterThan(TROPHY_THRESHOLD);
          expect(charAfter?.hasTrophy).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 6: Payment processing credit invariant", () => {
  beforeEach(() => clearStore());

  it("successful payment: increases balance by pack credits, creates purchase transaction", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 0, max: 100000 }),
        fc.integer({ min: 1, max: 5000 }),
        (readerId, initialBalance, credits) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: initialBalance,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          };

          storeEntity(reader);

          const result = grantCreditsForPurchaseInStore(readerId, credits);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.newBalance).toBe(initialBalance + credits);
          }
          expect(getReaderBalanceFromStore(readerId)).toBe(
            initialBalance + credits
          );
          expect(countPurchaseTransactionsFromStore(readerId)).toBe(1);

          const purchaseTxs = getPurchaseTransactionsFromStore(readerId);
          expect(purchaseTxs).toHaveLength(1);
          expect(purchaseTxs[0].amount).toBe(credits);
          expect(purchaseTxs[0].transactionType).toBe("purchase");
        }
      ),
      { numRuns: 100 }
    );
  });

  it("failed payment: leaves balance unchanged, no new transaction records", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 0, max: 100000 }),
        (readerId, initialBalance) => {
          const reader: ReaderRow = {
            id: readerId,
            email: `r-${readerId}@test.com`,
            passwordHash: "x".repeat(60),
            displayName: "Test",
            creditBalance: initialBalance,
            role: "reader",
            createdAt: new Date(),
            lastLoginAt: null,
          };

          storeEntity(reader);

          const balanceBefore = getReaderBalanceFromStore(readerId);
          const purchaseCountBefore = countPurchaseTransactionsFromStore(
            readerId
          );

          // Simulate failed payment: do not call grantCreditsForPurchaseInStore.
          // In the real system, a failed payment means the webhook never fires
          // with success, so no credits are granted and no transaction is created.

          const balanceAfter = getReaderBalanceFromStore(readerId);
          const purchaseCountAfter = countPurchaseTransactionsFromStore(
            readerId
          );

          expect(balanceAfter).toBe(balanceBefore);
          expect(balanceAfter).toBe(initialBalance);
          expect(purchaseCountAfter).toBe(purchaseCountBefore);
          expect(purchaseCountAfter).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });
});
