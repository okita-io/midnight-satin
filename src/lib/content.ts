/**
 * Midnight Satin Content Data Layer
 * Featured/trending novels with KV caching (Req 1.10, 11.1-11.5)
 *
 * Featured: admin-curated (is_featured, featured_order) or default (most recently updated)
 * Trending: engagement metric (reading_progress last 7 days) with optional admin override
 */

import { sql } from "@vercel/postgres";
import type { Novel } from "@/lib/db/types";
import {
  cacheGetOrSet,
  cacheKeyFeatured,
  cacheKeyTrending,
} from "@/lib/cache";

/** Novel with author name for display (NovelCard, hero, etc.) */
export interface NovelWithAuthor extends Novel {
  authorName: string;
}

/** Alias for component compatibility (HeroCarousel, HighSocietySection). */
export type FeaturedNovel = NovelWithAuthor;

/** Current reading for registered reader (Current Affairs section). */
export interface CurrentReading {
  novel: NovelWithAuthor;
  chapterNumber: number;
  chapterTitle: string;
  scrollPercent: number;
  chapterId: string;
}

/** Novel row from DB with optional author name (snake_case) */
interface NovelRow {
  id: string;
  title: string;
  series_id: string | null;
  author_id: string;
  cover_image_url: string | null;
  synopsis: string | null;
  genre_tags: string[];
  rating: number;
  rating_count: number;
  publication_date: string | null;
  created_at: Date;
  author_name?: string;
}

function rowToNovel(row: NovelRow): Novel {
  return {
    id: row.id,
    title: row.title,
    seriesId: row.series_id,
    authorId: row.author_id,
    coverImageUrl: row.cover_image_url,
    synopsis: row.synopsis,
    genreTags: Array.isArray(row.genre_tags) ? row.genre_tags : [],
    rating: Number(row.rating),
    ratingCount: Number(row.rating_count ?? 0),
    publicationDate: row.publication_date ? new Date(row.publication_date) : null,
    createdAt: new Date(row.created_at),
  };
}

function rowToNovelWithAuthor(row: NovelRow & { author_name: string }): NovelWithAuthor {
  return {
    ...rowToNovel(row),
    authorName: row.author_name || "Unknown",
  };
}

/**
 * Get featured novels for hero carousel.
 * Admin-curated: novels with is_featured=true ordered by featured_order.
 * Default: most recently updated novels (by latest chapter updated_at).
 * Cached in KV with TTL 300s.
 */
export async function getFeaturedNovels(limit: number = 5): Promise<NovelWithAuthor[]> {
  return cacheGetOrSet(cacheKeyFeatured(), async () => {
    let curatedRows: (NovelRow & { author_name: string })[] = [];
    try {
      const result = await sql<NovelRow & { author_name: string }>`
        SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url, n.synopsis,
               n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
               COALESCE(a.name, 'Unknown') AS author_name
        FROM novels n
        LEFT JOIN author_profiles a ON a.id = n.author_id
        WHERE n.is_featured = true
        ORDER BY n.featured_order ASC NULLS LAST
        LIMIT ${limit}
      `;
      curatedRows = result.rows;
    } catch {
      // Columns may not exist yet (migration not run); fall through to default
    }
    if (curatedRows.length > 0) {
      return curatedRows.map(rowToNovelWithAuthor);
    }
    const { rows: defaultRows } = await sql<NovelRow & { author_name: string }>`
      WITH latest_chapter AS (
        SELECT novel_id, MAX(updated_at) AS max_updated
        FROM chapters GROUP BY novel_id
      )
      SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url,
             n.synopsis, n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
             COALESCE(a.name, 'Unknown') AS author_name
      FROM novels n
      LEFT JOIN latest_chapter lc ON n.id = lc.novel_id
      LEFT JOIN author_profiles a ON a.id = n.author_id
      ORDER BY COALESCE(lc.max_updated, n.created_at) DESC NULLS LAST
      LIMIT ${limit}
    `;
    return defaultRows.map(rowToNovelWithAuthor);
  });
}

/**
 * Get trending novels for High Society section.
 * Metric: aggregate reading engagement (reading_progress) over last 7 days.
 * Cached in KV with TTL 300s.
 */
export async function getTrendingNovels(limit: number = 10): Promise<NovelWithAuthor[]> {
  return cacheGetOrSet(cacheKeyTrending(), async () => {
    const { rows } = await sql<NovelRow & { author_name: string }>`
      WITH engagement AS (
        SELECT c.novel_id, COUNT(*) AS read_count
        FROM reading_progress rp
        JOIN chapters c ON c.id = rp.chapter_id
        WHERE rp.last_read_at >= NOW() - INTERVAL '7 days'
        GROUP BY c.novel_id
      )
      SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url,
             n.synopsis, n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
             COALESCE(a.name, 'Unknown') AS author_name
      FROM novels n
      LEFT JOIN engagement e ON n.id = e.novel_id
      LEFT JOIN author_profiles a ON a.id = n.author_id
      ORDER BY COALESCE(e.read_count, 0) DESC, n.rating DESC NULLS LAST
      LIMIT ${limit}
    `;
    return rows.map(rowToNovelWithAuthor);
  });
}

/**
 * Get current reading for a registered reader (Property 12, Req 1.2, 16.3).
 * Returns the novel associated with the reading progress record that has the
 * most recent last_read_at timestamp, along with chapter number and completion percentage.
 */
export async function getCurrentReading(readerId: string): Promise<CurrentReading | null> {
  try {
    const { rows } = await sql<
      NovelRow & {
        author_name: string;
        chapter_id: string;
        chapter_number: number;
        chapter_title: string;
        scroll_percent: number;
      }
    >`
      SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url,
             n.synopsis, n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
             COALESCE(a.name, 'Unknown') AS author_name,
             c.id AS chapter_id, c.chapter_number, c.title AS chapter_title,
             rp.scroll_percent
      FROM reading_progress rp
      JOIN chapters c ON c.id = rp.chapter_id
      JOIN novels n ON n.id = c.novel_id
      LEFT JOIN author_profiles a ON a.id = n.author_id
      WHERE rp.reader_id = ${readerId}
      ORDER BY rp.last_read_at DESC
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      novel: rowToNovelWithAuthor(row),
      chapterNumber: row.chapter_number,
      chapterTitle: row.chapter_title,
      scrollPercent: Number(row.scroll_percent),
      chapterId: row.chapter_id,
    };
  } catch {
    return null;
  }
}

/**
 * Get all novels for Library catalog.
 * Not cached (full catalog may be large); use ISR on the page.
 */
export async function getAllNovels(limit: number = 100): Promise<NovelWithAuthor[]> {
  const { rows } = await sql<NovelRow & { author_name: string }>`
    SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url, n.synopsis,
           n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
           COALESCE(a.name, 'Unknown') AS author_name
    FROM novels n
    LEFT JOIN author_profiles a ON a.id = n.author_id
    ORDER BY n.created_at DESC
    LIMIT ${limit}
  `;
  return rows.map(rowToNovelWithAuthor);
}
