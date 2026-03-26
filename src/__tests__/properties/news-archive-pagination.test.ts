/**
 * Property 5: Archive pagination correctness
 * Validates: Requirements 2.4, 9.2, 9.3
 *
 * For any set of published news articles and any valid cursor (a published_at
 * ISO timestamp), getNewsArchive(cursor, limit) should return articles with
 * published_at strictly before the cursor, ordered by published_at descending,
 * with length ≤ limit. If more articles exist beyond the page, nextCursor
 * should be non-null and usable to fetch the next page without duplicates or gaps.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 5
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import type { NewsArticleRow } from "@/lib/content";
import type { NewsArticleType, SourcePlatform } from "@/lib/db/types";

const ARTICLE_TYPES: NewsArticleType[] = [
  "editorial",
  "campaign",
  "ranking",
  "popularity",
  "announcement",
];

const SOURCE_PLATFORMS: SourcePlatform[] = [
  "tiktok",
  "instagram",
  "x",
  "youtube",
  "facebook",
];

/**
 * Generate a valid Date (never NaN) within a safe range using integer
 * timestamps so fast-check shrinking stays deterministic.
 */
const arbValidDate = fc
  .integer({
    min: new Date("2020-01-01").getTime(),
    max: new Date("2030-01-01").getTime(),
  })
  .map((ms) => new Date(ms));

/** Arbitrary that produces a valid published summary row (without body_content) */
function arbPublishedRow(index: number) {
  return fc.record({
    id: fc.constant(`aaaaaaaa-bbbb-cccc-dddd-${String(index).padStart(12, "0")}`),
    title: fc.string({ minLength: 1, maxLength: 60 }),
    slug: fc.constant(`slug-${index}`),
    article_type: fc.constantFrom(...ARTICLE_TYPES),
    hero_image_url: fc.option(fc.webUrl(), { nil: null }),
    summary: fc.string({ minLength: 1, maxLength: 120 }),
    tags: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { maxLength: 5 }),
    attribution: fc.string({ minLength: 1, maxLength: 60 }),
    source_url: fc.option(fc.webUrl(), { nil: null }),
    source_platform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), { nil: null }),
    is_published: fc.constant(true),
    is_featured: fc.boolean(),
    featured_order: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
    published_at: arbValidDate,
    created_at: arbValidDate,
    updated_at: arbValidDate,
  });
}

/**
 * Generate an array of published rows with guaranteed unique IDs and unique
 * published_at timestamps (millisecond precision).
 */
const arbUniquePublishedRows = fc
  .integer({ min: 0, max: 15 })
  .chain((count) => {
    if (count === 0) return fc.constant([]);
    const arbs = Array.from({ length: count }, (_, i) => arbPublishedRow(i));
    return fc.tuple(...(arbs as [ReturnType<typeof arbPublishedRow>, ...ReturnType<typeof arbPublishedRow>[]]));
  })
  .chain((rows) => {
    // Assign unique published_at timestamps by generating sorted unique ints
    const arr = Array.isArray(rows) ? rows : [];
    if (arr.length === 0) return fc.constant([]);
    return fc
      .uniqueArray(
        fc.integer({
          min: new Date("2020-01-01").getTime(),
          max: new Date("2030-01-01").getTime(),
        }),
        { minLength: arr.length, maxLength: arr.length }
      )
      .map((timestamps) =>
        arr.map((row, i) => ({ ...row, published_at: new Date(timestamps[i]) }))
      );
  });

// Mock @vercel/postgres before importing content.ts
vi.mock("@vercel/postgres", () => ({
  sql: vi.fn(),
}));

// Mock the cache module to avoid KV dependency
vi.mock("@/lib/cache", () => ({
  cacheGetOrSet: vi.fn((_key: string, fn: () => Promise<unknown>) => fn()),
  cacheGet: vi.fn(() => null),
  cacheSet: vi.fn(),
  cacheKeyFeatured: vi.fn(() => "featured"),
  cacheKeyTrending: vi.fn(() => "trending"),
  cacheKeyAuthor: vi.fn((id: string) => `author:${id}`),
}));


/**
 * Simulates the DB behaviour of getNewsArchive: filters by cursor, sorts
 * descending by published_at, and applies fetchLimit.
 */
function simulateDbQuery(
  allRows: Omit<NewsArticleRow, "body_content">[],
  cursor: string | undefined,
  fetchLimit: number
): Omit<NewsArticleRow, "body_content">[] {
  let filtered = allRows;
  if (cursor) {
    const cursorTime = new Date(cursor).getTime();
    filtered = allRows.filter(
      (r) => r.published_at !== null && r.published_at.getTime() < cursorTime
    );
  }
  return [...filtered]
    .sort((a, b) => {
      const da = a.published_at ? a.published_at.getTime() : 0;
      const db = b.published_at ? b.published_at.getTime() : 0;
      return db - da;
    })
    .slice(0, fetchLimit);
}

describe("Property 5: Archive pagination correctness", () => {
  let getNewsArchive: typeof import("@/lib/content").getNewsArchive;
  let sqlMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const vercelPostgres = await import("@vercel/postgres");
    sqlMock = vercelPostgres.sql as unknown as ReturnType<typeof vi.fn>;

    const contentModule = await import("@/lib/content");
    getNewsArchive = contentModule.getNewsArchive;
  });

  it("returns articles before cursor, ordered descending, within limit, with correct nextCursor", async () => {
    /**
     * Validates: Requirements 2.4, 9.2, 9.3
     */
    await fc.assert(
      fc.asyncProperty(
        arbUniquePublishedRows,
        fc.integer({ min: 1, max: 8 }),
        fc.option(arbValidDate.map((d) => d.toISOString()), { nil: undefined }),
        async (articles, limit, cursor) => {
          const fetchLimit = limit + 1;
          const dbRows = simulateDbQuery(articles, cursor, fetchLimit);

          sqlMock.mockResolvedValueOnce({ rows: dbRows });

          const result = await getNewsArchive(cursor, limit);

          // Property: result length ≤ limit
          expect(result.articles.length).toBeLessThanOrEqual(limit);

          // Property: all articles are ordered by published_at descending
          for (let i = 1; i < result.articles.length; i++) {
            const prevDate = result.articles[i - 1].publishedAt?.getTime() ?? 0;
            const currDate = result.articles[i].publishedAt?.getTime() ?? 0;
            expect(prevDate).toBeGreaterThanOrEqual(currDate);
          }

          // Property: if cursor provided, all articles have published_at < cursor
          if (cursor) {
            const cursorTime = new Date(cursor).getTime();
            for (const article of result.articles) {
              if (article.publishedAt) {
                expect(article.publishedAt.getTime()).toBeLessThan(cursorTime);
              }
            }
          }

          // Property: nextCursor is non-null iff more articles exist beyond this page
          const totalMatching = simulateDbQuery(
            articles,
            cursor,
            articles.length + 1
          ).length;
          if (totalMatching > limit) {
            expect(result.nextCursor).not.toBeNull();
          } else {
            expect(result.nextCursor).toBeNull();
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("paginating through all pages produces no duplicates and no gaps", async () => {
    /**
     * Validates: Requirements 2.4, 9.2, 9.3
     */
    await fc.assert(
      fc.asyncProperty(
        arbUniquePublishedRows,
        fc.integer({ min: 1, max: 5 }),
        async (articles, limit) => {
          if (articles.length === 0) return;

          // Expected full set sorted by published_at DESC
          const allSorted = [...articles].sort(
            (a, b) => b.published_at.getTime() - a.published_at.getTime()
          );

          const collectedIds: string[] = [];
          let cursor: string | undefined = undefined;
          const maxIterations = Math.ceil(articles.length / limit) + 2;

          for (let i = 0; i < maxIterations; i++) {
            const fetchLimit = limit + 1;
            const dbRows = simulateDbQuery(articles, cursor, fetchLimit);
            sqlMock.mockResolvedValueOnce({ rows: dbRows });

            const result = await getNewsArchive(cursor, limit);

            for (const article of result.articles) {
              collectedIds.push(article.id);
            }

            if (result.nextCursor === null) break;
            cursor = result.nextCursor;
          }

          // No duplicates
          const idSet = new Set(collectedIds);
          expect(idSet.size).toBe(collectedIds.length);

          // No gaps — collected all articles
          expect(collectedIds.length).toBe(allSorted.length);

          // Correct ordering — IDs match the expected sorted order
          const expectedIds = allSorted.map((a) => a.id);
          expect(collectedIds).toEqual(expectedIds);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns empty result with null cursor when no articles exist", async () => {
    /**
     * Validates: Requirements 2.4
     */
    await fc.assert(
      fc.asyncProperty(fc.integer({ min: 1, max: 10 }), async (limit) => {
        sqlMock.mockResolvedValueOnce({ rows: [] });

        const result = await getNewsArchive(undefined, limit);

        expect(result.articles).toEqual([]);
        expect(result.nextCursor).toBeNull();
      }),
      { numRuns: 100 }
    );
  });
});
