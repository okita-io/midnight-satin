/**
 * Property 17: Author follow invariant
 * Validates: Requirements 7.6
 *
 * For any reader and any author, calling followAuthor should create an author_follow
 * record and increment the author's follower_count by exactly 1. Calling followAuthor
 * again for the same reader/author pair should be idempotent (no duplicate record,
 * no additional increment).
 *
 * Property 18: Author bibliography grouping
 * Validates: Requirements 7.5
 *
 * For any author with novels across multiple series, the bibliography query should
 * return all novels grouped by their series, with each group containing only novels
 * belonging to that series. Novels without a series should appear in a separate
 * "Standalone" group.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  followAuthorInStore,
  hasAuthorFollowFromStore,
  getAuthorFollowerCountFromStore,
  getAuthorBibliographyFromStore,
} from "@/lib/db/store";
import type {
  ReaderRow,
  AuthorProfile,
  Series,
  Novel,
} from "@/lib/db/types";

describe("Property 17: Author follow invariant", () => {
  beforeEach(() => clearStore());

  it("first follow: creates record and increments follower_count by 1", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 0, max: 100 }),
        (readerId, authorId, initialFollowerCount) => {
          fc.pre(readerId !== authorId);
          clearStore();
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
            followerCount: initialFollowerCount,
            createdAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);

          const result = followAuthorInStore(readerId, authorId);

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.newFollowerCount).toBe(initialFollowerCount + 1);
          }
          expect(hasAuthorFollowFromStore(readerId, authorId)).toBe(true);
          expect(getAuthorFollowerCountFromStore(authorId)).toBe(
            initialFollowerCount + 1
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("second follow (same reader/author): idempotent, no duplicate, no extra increment", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 0, max: 100 }),
        (readerId, authorId, initialFollowerCount) => {
          fc.pre(readerId !== authorId);
          clearStore();
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
            followerCount: initialFollowerCount,
            createdAt: new Date(),
          };

          storeEntity(reader);
          storeEntity(author);

          const first = followAuthorInStore(readerId, authorId);
          expect(first.success).toBe(true);

          const second = followAuthorInStore(readerId, authorId);
          expect(second.success).toBe(true);
          if (first.success && second.success) {
            expect(second.newFollowerCount).toBe(first.newFollowerCount);
          }
          expect(hasAuthorFollowFromStore(readerId, authorId)).toBe(true);
          expect(getAuthorFollowerCountFromStore(authorId)).toBe(
            initialFollowerCount + 1
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("multiple readers follow same author: each increments count by 1", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 2, maxLength: 10 }),
        (authorId, readerIds) => {
          clearStore();
          const author: AuthorProfile = {
            id: authorId,
            name: "Author",
            avatarUrl: null,
            biography: null,
            styleTags: [],
            followerCount: 0,
            createdAt: new Date(),
          };
          storeEntity(author);

          const uniqueReaders = [...new Set(readerIds)];
          for (const readerId of uniqueReaders) {
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
            storeEntity(reader);
            const result = followAuthorInStore(readerId, authorId);
            expect(result.success).toBe(true);
          }

          expect(getAuthorFollowerCountFromStore(authorId)).toBe(
            uniqueReaders.length
          );
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 18: Author bibliography grouping", () => {
  beforeEach(() => clearStore());

  it("novels grouped by series; each group contains only novels of that series", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(
          fc.record({
            seriesId: fc.option(fc.uuid(), { nil: undefined }),
            title: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          { minLength: 1, maxLength: 20 }
        ),
        (authorId, novelSpecs) => {
          clearStore();
          const author: AuthorProfile = {
            id: authorId,
            name: "Author",
            avatarUrl: null,
            biography: null,
            styleTags: [],
            followerCount: 0,
            createdAt: new Date(),
          };
          storeEntity(author);

          const seriesMap = new Map<string, Series>();
          const novels: Novel[] = [];

          for (const spec of novelSpecs) {
            const seriesId = spec.seriesId ?? null;
            if (seriesId) {
              if (!seriesMap.has(seriesId)) {
                const s: Series = {
                  id: seriesId,
                  title: `Series-${seriesId.slice(0, 8)}`,
                  authorId,
                  description: null,
                  genreTags: [],
                  isComplete: false,
                  createdAt: new Date(),
                };
                seriesMap.set(seriesId, s);
                storeEntity(s);
              }
            }

            const novel: Novel = {
              id: crypto.randomUUID(),
              title: spec.title,
              seriesId,
              authorId,
              coverImageUrl: null,
              synopsis: null,
              genreTags: [],
              rating: 0,
              ratingCount: 0,
              publicationDate: null,
              createdAt: new Date(),
            };
            novels.push(novel);
            storeEntity(novel);
          }

          const { groups, worksCount } =
            getAuthorBibliographyFromStore(authorId);

          expect(worksCount).toBe(novels.length);

          const allNovelsInGroups = groups.flatMap((g) => g.novels);
          expect(allNovelsInGroups).toHaveLength(novels.length);

          for (const group of groups) {
            const seriesIdsInGroup = new Set(
              group.novels.map((n) => n.seriesId).filter(Boolean)
            );
            if (group.seriesId === null) {
              expect(group.seriesTitle).toBe("Standalone Novels");
              for (const n of group.novels) {
                expect(n.seriesId).toBeNull();
              }
            } else {
              for (const n of group.novels) {
                expect(n.seriesId).toBe(group.seriesId);
              }
              expect(seriesIdsInGroup.size).toBeLessThanOrEqual(1);
            }
          }

          const novelIdsFromGroups = new Set(
            groups.flatMap((g) => g.novels.map((n) => n.id))
          );
          const novelIdsExpected = new Set(novels.map((n) => n.id));
          expect(novelIdsFromGroups).toEqual(novelIdsExpected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("standalone novels appear in separate Standalone group", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
        (authorId, novelIds) => {
          clearStore();
          const author: AuthorProfile = {
            id: authorId,
            name: "Author",
            avatarUrl: null,
            biography: null,
            styleTags: [],
            followerCount: 0,
            createdAt: new Date(),
          };
          storeEntity(author);

          for (const novelId of novelIds) {
            const novel: Novel = {
              id: novelId,
              title: `Standalone-${novelId.slice(0, 8)}`,
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
            storeEntity(novel);
          }

          const { groups } = getAuthorBibliographyFromStore(authorId);

          const standaloneGroup = groups.find(
            (g) => g.seriesTitle === "Standalone Novels"
          );
          expect(standaloneGroup).toBeDefined();
          expect(standaloneGroup!.seriesId).toBeNull();
          expect(standaloneGroup!.novels).toHaveLength(novelIds.length);
          for (const n of standaloneGroup!.novels) {
            expect(n.seriesId).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("author with novels in multiple series: each series has its own group", () => {
    const authorId = crypto.randomUUID();
    const seriesAId = crypto.randomUUID();
    const seriesBId = crypto.randomUUID();

    const author: AuthorProfile = {
      id: authorId,
      name: "Author",
      avatarUrl: null,
      biography: null,
      styleTags: [],
      followerCount: 0,
      createdAt: new Date(),
    };
    const seriesA: Series = {
      id: seriesAId,
      title: "Series A",
      authorId,
      description: null,
      genreTags: [],
      isComplete: false,
      createdAt: new Date(),
    };
    const seriesB: Series = {
      id: seriesBId,
      title: "Series B",
      authorId,
      description: null,
      genreTags: [],
      isComplete: true,
      createdAt: new Date(),
    };

    const novelA1: Novel = {
      id: crypto.randomUUID(),
      title: "Novel A1",
      seriesId: seriesAId,
      authorId,
      coverImageUrl: null,
      synopsis: null,
      genreTags: [],
      rating: 4,
      ratingCount: 10,
      publicationDate: null,
      createdAt: new Date(),
    };
    const novelA2: Novel = {
      id: crypto.randomUUID(),
      title: "Novel A2",
      seriesId: seriesAId,
      authorId,
      coverImageUrl: null,
      synopsis: null,
      genreTags: [],
      rating: 3,
      ratingCount: 5,
      publicationDate: null,
      createdAt: new Date(),
    };
    const novelB1: Novel = {
      id: crypto.randomUUID(),
      title: "Novel B1",
      seriesId: seriesBId,
      authorId,
      coverImageUrl: null,
      synopsis: null,
      genreTags: [],
      rating: 5,
      ratingCount: 20,
      publicationDate: null,
      createdAt: new Date(),
    };
    const novelStandalone: Novel = {
      id: crypto.randomUUID(),
      title: "Standalone Novel",
      seriesId: null,
      authorId,
      coverImageUrl: null,
      synopsis: null,
      genreTags: [],
      rating: 2,
      ratingCount: 0,
      publicationDate: null,
      createdAt: new Date(),
    };

    storeEntity(author);
    storeEntity(seriesA);
    storeEntity(seriesB);
    storeEntity(novelA1);
    storeEntity(novelA2);
    storeEntity(novelB1);
    storeEntity(novelStandalone);

    const { groups, worksCount, avgRating } =
      getAuthorBibliographyFromStore(authorId);

    expect(worksCount).toBe(4);
    expect(avgRating).toBeCloseTo((4 + 3 + 5 + 2) / 4, 5);

    const seriesAGroup = groups.find((g) => g.seriesId === seriesAId);
    const seriesBGroup = groups.find((g) => g.seriesId === seriesBId);
    const standaloneGroup = groups.find((g) => g.seriesId === null);

    expect(seriesAGroup).toBeDefined();
    expect(seriesAGroup!.seriesTitle).toBe("Series A");
    expect(seriesAGroup!.novels).toHaveLength(2);
    expect(seriesAGroup!.novels.map((n) => n.id).sort()).toEqual(
      [novelA1.id, novelA2.id].sort()
    );

    expect(seriesBGroup).toBeDefined();
    expect(seriesBGroup!.seriesTitle).toBe("Series B");
    expect(seriesBGroup!.isComplete).toBe(true);
    expect(seriesBGroup!.novels).toHaveLength(1);
    expect(seriesBGroup!.novels[0].id).toBe(novelB1.id);

    expect(standaloneGroup).toBeDefined();
    expect(standaloneGroup!.seriesTitle).toBe("Standalone Novels");
    expect(standaloneGroup!.novels).toHaveLength(1);
    expect(standaloneGroup!.novels[0].id).toBe(novelStandalone.id);
  });
});
