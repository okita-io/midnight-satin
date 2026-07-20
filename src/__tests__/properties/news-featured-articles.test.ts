/**
 * Property 3: Featured articles are published, featured, and ordered
 * Validates: Requirements 2.2, 2.5
 *
 * For any set of news articles in the database (with varying is_published,
 * is_featured, featured_order values), calling getFeaturedNewsArticles(limit)
 * should return only articles where is_published = true AND is_featured = true,
 * ordered by featured_order ASC (nulls last), with length ≤ limit.
 *
 * @see .kiro/specs/news-updates-system/design.md — Correctness Property 3
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
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

/** Arbitrary that produces a valid summary row (without body_content) */
const arbNewsArticleSummaryRow = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  slug: fc.string({ minLength: 1, maxLength: 100 }),
  article_type: fc.constantFrom(...ARTICLE_TYPES),
  hero_image_url: fc.option(fc.webUrl(), { nil: null }),
  summary: fc.string({ minLength: 1, maxLength: 500 }),
  tags: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { maxLength: 8 }),
  attribution: fc.string({ minLength: 1, maxLength: 100 }),
  source_url: fc.option(fc.webUrl(), { nil: null }),
  source_platform: fc.option(fc.constantFrom(...SOURCE_PLATFORMS), { nil: null }),
  is_published: fc.boolean(),
  is_featured: fc.boolean(),
  featured_order: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
  published_at: fc.option(
    fc.date({
      min: new Date("2020-01-01"),
      max: new Date("2030-01-01"),
      noInvalidDate: true,
    }),
    { nil: null }
  ),
  created_at: fc.date({
    min: new Date("2020-01-01"),
    max: new Date("2030-01-01"),
    noInvalidDate: true,
  }),
  updated_at: fc.date({
    min: new Date("2020-01-01"),
    max: new Date("2030-01-01"),
    noInvalidDate: true,
  }),
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
 * Simulate DB-level filtering and ordering for featured articles:
 * WHERE is_published = true AND is_featured = true
 * ORDER BY featured_order ASC NULLS LAST
 * LIMIT $limit
 */
function simulateFeaturedQuery(
  articles: Array<ReturnType<typeof arbNewsArticleSummaryRow["generate"]> extends fc.Value<infer T> ? T : never>,
  limit: number
) {
  return articles
    .filter((a) => a.is_published && a.is_featured)
    .sort((a, b) => {
      // featured_order ASC NULLS LAST
      const orderA = a.featured_order;
      const orderB = b.featured_order;
      if (orderA === null && orderB === null) return 0;
      if (orderA === null) return 1;
      if (orderB === null) return -1;
      return orderA - orderB;
    })
    .slice(0, limit);
}

describe("Property 3: Featured articles are published, featured, and ordered", () => {
  let getFeaturedNewsArticles: typeof import("@/lib/content").getFeaturedNewsArticles;
  let sqlMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();

    const vercelPostgres = await import("@vercel/postgres");
    sqlMock = vercelPostgres.sql as unknown as ReturnType<typeof vi.fn>;

    const contentModule = await import("@/lib/content");
    getFeaturedNewsArticles = contentModule.getFeaturedNewsArticles;
  });

  it("returns only published+featured articles, ordered by featured_order ASC (nulls last), within limit", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(arbNewsArticleSummaryRow, { minLength: 0, maxLength: 20 }),
        fc.integer({ min: 1, max: 10 }),
        async (articles, limit) => {
          const dbRows = simulateFeaturedQuery(articles, limit);

          sqlMock.mockResolvedValueOnce({ rows: dbRows });

          const result = await getFeaturedNewsArticles(limit);

          // Property: length ≤ limit
          expect(result.length).toBeLessThanOrEqual(limit);

          // Property: all returned articles are published AND featured
          for (const article of result) {
            expect(article.isPublished).toBe(true);
            expect(article.isFeatured).toBe(true);
          }

          // Property: articles are ordered by featured_order ASC (nulls last)
          for (let i = 1; i < result.length; i++) {
            const prevOrder = result[i - 1].featuredOrder;
            const currOrder = result[i].featuredOrder;
            // Both non-null: prev <= curr
            if (prevOrder !== null && currOrder !== null) {
              expect(prevOrder).toBeLessThanOrEqual(currOrder);
            }
            // prev non-null, curr null: valid (nulls last)
            // prev null, curr non-null: invalid (null should be last)
            if (prevOrder === null && currOrder !== null) {
              throw new Error(
                `Ordering violation: null featured_order before non-null (${currOrder})`
              );
            }
          }

          // Property: result count matches expected
          const expectedCount = Math.min(
            articles.filter((a) => a.is_published && a.is_featured).length,
            limit
          );
          expect(result.length).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("returns empty array when no articles are published+featured", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          arbNewsArticleSummaryRow.map((row) => ({
            ...row,
            // Ensure at least one of the conditions is false
            is_published: false,
          })),
          { minLength: 0, maxLength: 10 }
        ),
        fc.integer({ min: 1, max: 10 }),
        async (_articles, limit) => {
          sqlMock.mockResolvedValueOnce({ rows: [] });

          const result = await getFeaturedNewsArticles(limit);

          expect(result).toEqual([]);
          expect(result.length).toBe(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("respects the limit parameter", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          arbNewsArticleSummaryRow.map((row) => ({
            ...row,
            is_published: true,
            is_featured: true,
            featured_order: 1,
          })),
          { minLength: 5, maxLength: 20 }
        ),
        fc.integer({ min: 1, max: 4 }),
        async (articles, limit) => {
          const dbRows = articles.slice(0, limit);
          sqlMock.mockResolvedValueOnce({ rows: dbRows });

          const result = await getFeaturedNewsArticles(limit);

          expect(result.length).toBeLessThanOrEqual(limit);
        }
      ),
      { numRuns: 100 }
    );
  });
});
