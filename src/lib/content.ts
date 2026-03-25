/**
 * Midnight Satin Content Data Layer
 * Featured/trending novels with KV caching (Req 1.10, 11.1-11.5)
 *
 * Featured: admin-curated (is_featured, featured_order) or default (most recently updated)
 * Trending: engagement metric (reading_progress last 7 days) with optional admin override
 */

import { sql } from "@vercel/postgres";
import type { Novel, AuthorProfile, NewsArticle, NewsArticleSummary, NewsArticleType } from "@/lib/db/types";
import {
  cacheGetOrSet,
  cacheGet,
  cacheSet,
  cacheKeyFeatured,
  cacheKeyTrending,
  cacheKeyAuthor,
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

/** Novel for Library catalog with extended metadata (author bio, chapter count). */
export interface LibraryNovel extends NovelWithAuthor {
  authorBio: string | null;
  chapterCount: number;
}

/**
 * Get all novels for Library catalog with extended metadata for desktop list view.
 * Includes author bio and chapter count. Not cached; use ISR on the page.
 */
export async function getAllNovels(limit: number = 100): Promise<LibraryNovel[]> {
  const { rows } = await sql<
    NovelRow & {
      author_name: string;
      author_bio: string | null;
      chapter_count: string;
    }
  >`
    SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url, n.synopsis,
           n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
           COALESCE(a.name, 'Unknown') AS author_name,
           a.biography AS author_bio,
           COALESCE(ch.cnt, 0)::text AS chapter_count
    FROM novels n
    LEFT JOIN author_profiles a ON a.id = n.author_id
    LEFT JOIN (
      SELECT novel_id, COUNT(*) AS cnt FROM chapters GROUP BY novel_id
    ) ch ON ch.novel_id = n.id
    ORDER BY n.created_at DESC
    LIMIT ${limit}
  `;
  return rows.map((r) => ({
    ...rowToNovelWithAuthor(r),
    authorBio: r.author_bio ?? null,
    chapterCount: parseInt(r.chapter_count, 10) || 0,
  }));
}

/** Novel with author name for Novel Detail page. */
export interface NovelWithAuthorName extends Novel {
  authorName: string;
}

/** Chapter row from DB (snake_case). */
interface ChapterRow {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_free: boolean;
  created_at: Date;
  updated_at: Date;
}

/** Character row from DB (snake_case). */
interface CharacterRow {
  id: string;
  novel_id: string;
  name: string;
  role_subtitle: string | null;
  portrait_url: string | null;
  description: string | null;
  backstory: string | null;
  stats: Record<string, unknown>;
  secrets: string[];
  endorsement_count: number;
  has_trophy: boolean;
  created_at: Date;
}

/** Chapter type for Novel Detail page. */
export interface NovelChapter {
  id: string;
  novelId: string;
  chapterNumber: number;
  title: string;
  content: string;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Character type for Novel Detail. */
export interface NovelCharacter {
  id: string;
  novelId: string;
  name: string;
  roleSubtitle: string | null;
  portraitUrl: string | null;
  description: string | null;
  backstory: string | null;
  stats: Record<string, unknown>;
  secrets: string[];
  endorsementCount: number;
  hasTrophy: boolean;
  createdAt: Date;
}

function rowToChapter(row: ChapterRow): NovelChapter {
  return {
    id: row.id,
    novelId: row.novel_id,
    chapterNumber: row.chapter_number,
    title: row.title,
    content: row.content,
    isFree: row.is_free,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function rowToCharacter(row: CharacterRow): NovelCharacter {
  return {
    id: row.id,
    novelId: row.novel_id,
    name: row.name,
    roleSubtitle: row.role_subtitle,
    portraitUrl: row.portrait_url,
    description: row.description,
    backstory: row.backstory,
    stats: (row.stats as Record<string, unknown>) ?? {},
    secrets: Array.isArray(row.secrets) ? row.secrets : [],
    endorsementCount: Number(row.endorsement_count ?? 0),
    hasTrophy: Boolean(row.has_trophy),
    createdAt: new Date(row.created_at),
  };
}

/**
 * Get a single novel by ID with author name.
 */
export async function getNovel(novelId: string): Promise<NovelWithAuthorName | null> {
  try {
    const { rows } = await sql<NovelRow & { author_name: string }>`
      SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url, n.synopsis,
             n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
             COALESCE(a.name, 'Unknown') AS author_name
      FROM novels n
      LEFT JOIN author_profiles a ON a.id = n.author_id
      WHERE n.id = ${novelId}
    `;
    if (rows.length === 0) return null;
    return {
      ...rowToNovel(rows[0]),
      authorName: rows[0].author_name ?? "Unknown",
    };
  } catch {
    return null;
  }
}

/**
 * Get chapters for a novel, ordered by chapter number.
 */
export async function getChapters(novelId: string): Promise<NovelChapter[]> {
  try {
    const { rows } = await sql<ChapterRow>`
      SELECT id, novel_id, chapter_number, title, content, is_free, created_at, updated_at
      FROM chapters
      WHERE novel_id = ${novelId}
      ORDER BY chapter_number ASC
    `;
    return rows.map(rowToChapter);
  } catch {
    return [];
  }
}

/**
 * Get characters for a novel.
 */
export async function getCharacters(novelId: string): Promise<NovelCharacter[]> {
  try {
    const { rows } = await sql<CharacterRow>`
      SELECT id, novel_id, name, role_subtitle, portrait_url, description, backstory,
             stats, secrets, endorsement_count, has_trophy, created_at
      FROM characters
      WHERE novel_id = ${novelId}
      ORDER BY created_at ASC
    `;
    return rows.map(rowToCharacter);
  } catch {
    return [];
  }
}

/**
 * Get the most recent chapter updated_at for a novel (for "Updated X ago").
 */
export async function getLatestChapterUpdatedAt(novelId: string): Promise<Date | null> {
  try {
    const { rows } = await sql<{ updated_at: Date }>`
      SELECT MAX(updated_at) AS updated_at FROM chapters WHERE novel_id = ${novelId}
    `;
    const val = rows[0]?.updated_at;
    return val ? new Date(val) : null;
  } catch {
    return null;
  }
}

/**
 * Get chapter IDs that the reader has unlocked (for Novel Detail chapter list).
 */
export async function getUnlockedChapterIds(readerId: string, novelId: string): Promise<Set<string>> {
  try {
    const { rows } = await sql<{ chapter_id: string }>`
      SELECT cu.chapter_id
      FROM chapter_unlocks cu
      JOIN chapters c ON c.id = cu.chapter_id
      WHERE cu.reader_id = ${readerId} AND c.novel_id = ${novelId}
    `;
    return new Set(rows.map((r) => r.chapter_id));
  } catch {
    return new Set();
  }
}

/**
 * Get reading progress for a novel (chapter_id -> scroll_percent) for first-unread logic.
 */
export async function getReadingProgressForNovel(
  readerId: string,
  novelId: string
): Promise<Map<string, number>> {
  try {
    const { rows } = await sql<{ chapter_id: string; scroll_percent: number }>`
      SELECT rp.chapter_id, rp.scroll_percent
      FROM reading_progress rp
      JOIN chapters c ON c.id = rp.chapter_id
      WHERE rp.reader_id = ${readerId} AND c.novel_id = ${novelId}
    `;
    return new Map(rows.map((r) => [r.chapter_id, Number(r.scroll_percent)]));
  } catch {
    return new Map();
  }
}

/**
 * Get a single chapter by ID.
 */
export async function getChapter(chapterId: string): Promise<NovelChapter | null> {
  try {
    const { rows } = await sql<ChapterRow>`
      SELECT id, novel_id, chapter_number, title, content, is_free, created_at, updated_at
      FROM chapters
      WHERE id = ${chapterId}
    `;
    if (rows.length === 0) return null;
    return rowToChapter(rows[0]);
  } catch {
    return null;
  }
}

/**
 * Get the first unread chapter ID for the FAB (Property 15).
 * First chapter where scroll_percent < 100 or no progress. If all completed, first chapter.
 */
export function getFirstUnreadChapterId(
  chapters: NovelChapter[],
  progress: Map<string, number>
): string {
  if (chapters.length === 0) return "";
  for (const ch of chapters) {
    const pct = progress.get(ch.id);
    if (pct === undefined || pct < 100) return ch.id;
  }
  return chapters[0].id;
}

/** Author profile row from DB (snake_case). */
interface AuthorRow {
  id: string;
  name: string;
  avatar_url: string | null;
  biography: string | null;
  style_tags: string[];
  follower_count: number;
  created_at: Date;
}

function rowToAuthorProfile(row: AuthorRow): AuthorProfile {
  return {
    id: row.id,
    name: row.name,
    avatarUrl: row.avatar_url,
    biography: row.biography,
    styleTags: Array.isArray(row.style_tags) ? row.style_tags : [],
    followerCount: Number(row.follower_count ?? 0),
    createdAt: new Date(row.created_at),
  };
}

/**
 * Get author profile by ID. Cached in KV with TTL 300s (Req 11.1, ISR 60s on page).
 */
export async function getAuthor(authorId: string): Promise<AuthorProfile | null> {
  const cached = await cacheGet<AuthorProfile>(cacheKeyAuthor(authorId));
  if (cached != null) return cached;
  const { rows } = await sql<AuthorRow>`
    SELECT id, name, avatar_url, biography, style_tags, follower_count, created_at
    FROM author_profiles
    WHERE id = ${authorId}
  `;
  if (rows.length === 0) return null;
  const author = rowToAuthorProfile(rows[0]);
  await cacheSet(cacheKeyAuthor(authorId), author);
  return author;
}

/** Novel in bibliography with series info. */
export interface BibliographyNovel extends Novel {
  seriesTitle: string | null;
  seriesIsComplete: boolean;
}

/** Bibliography grouped by series (Req 7.5, Property 18). */
export interface BibliographyGroup {
  seriesId: string | null;
  seriesTitle: string;
  isComplete: boolean;
  novels: BibliographyNovel[];
}

/**
 * Get author bibliography grouped by series. Standalone novels in separate group.
 */
export async function getAuthorBibliography(
  authorId: string
): Promise<{ groups: BibliographyGroup[]; worksCount: number; avgRating: number }> {
  const { rows } = await sql<
    NovelRow & {
      series_title: string | null;
      series_is_complete: boolean;
    }
  >`
    SELECT n.id, n.title, n.series_id, n.author_id, n.cover_image_url, n.synopsis,
           n.genre_tags, n.rating, n.rating_count, n.publication_date, n.created_at,
           s.title AS series_title, s.is_complete AS series_is_complete
    FROM novels n
    LEFT JOIN series s ON s.id = n.series_id
    WHERE n.author_id = ${authorId}
    ORDER BY s.title ASC NULLS LAST, n.publication_date ASC NULLS LAST, n.created_at ASC
  `;

  const novels: BibliographyNovel[] = rows.map((r) => ({
    ...rowToNovel(r),
    seriesTitle: r.series_title,
    seriesIsComplete: Boolean(r.series_is_complete),
  }));

  const groupMap = new Map<string | "standalone", BibliographyGroup>();

  for (const n of novels) {
    const key = n.seriesId ?? "standalone";
    const seriesTitle = n.seriesTitle ?? "Standalone Novels";
    const isComplete = n.seriesIsComplete ?? false;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        seriesId: n.seriesId,
        seriesTitle,
        isComplete,
        novels: [],
      });
    }
    groupMap.get(key)!.novels.push(n);
  }

  const groups = Array.from(groupMap.values());

  const worksCount = novels.length;
  const totalRating = novels.reduce((sum, n) => sum + n.rating, 0);
  const avgRating = worksCount > 0 ? totalRating / worksCount : 0;

  return { groups, worksCount, avgRating };
}


// ---------------------------------------------------------------------------
// News Articles (news-updates-system spec)
// ---------------------------------------------------------------------------

/** News article row from DB (snake_case) */
export interface NewsArticleRow {
  id: string;
  title: string;
  slug: string;
  article_type: string;
  hero_image_url: string | null;
  summary: string;
  body_content: string;
  tags: string[];
  attribution: string;
  source_url: string | null;
  source_platform: string | null;
  is_published: boolean;
  is_featured: boolean;
  featured_order: number | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export function rowToNewsArticle(row: NewsArticleRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    articleType: row.article_type as NewsArticleType,
    heroImageUrl: row.hero_image_url,
    summary: row.summary,
    bodyContent: row.body_content,
    tags: Array.isArray(row.tags) ? row.tags : [],
    attribution: row.attribution,
    sourceUrl: row.source_url,
    sourcePlatform: row.source_platform as NewsArticle["sourcePlatform"],
    isPublished: Boolean(row.is_published),
    isFeatured: Boolean(row.is_featured),
    featuredOrder: row.featured_order != null ? Number(row.featured_order) : null,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function rowToNewsArticleSummary(
  row: Omit<NewsArticleRow, "body_content">
): NewsArticleSummary {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    articleType: row.article_type as NewsArticleType,
    heroImageUrl: row.hero_image_url,
    summary: row.summary,
    tags: Array.isArray(row.tags) ? row.tags : [],
    attribution: row.attribution,
    sourceUrl: row.source_url,
    sourcePlatform: row.source_platform as NewsArticle["sourcePlatform"],
    isPublished: Boolean(row.is_published),
    isFeatured: Boolean(row.is_featured),
    featuredOrder: row.featured_order != null ? Number(row.featured_order) : null,
    publishedAt: row.published_at ? new Date(row.published_at) : null,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/** Attribution helper per Req 8.1–8.3 */
export function getNewsAttribution(article: {
  articleType: NewsArticleType;
  attribution: string;
}): string {
  switch (article.articleType) {
    case "editorial":
    case "announcement":
      return "From the Editor";
    case "ranking":
    case "popularity":
      return "Staff";
    case "campaign":
      return article.attribution || "Staff";
  }
}

/**
 * Get latest published news articles ordered by published_at DESC.
 */
export async function getLatestNewsArticles(
  limit: number = 3
): Promise<NewsArticleSummary[]> {
  try {
    const { rows } = await sql<Omit<NewsArticleRow, "body_content">>`
      SELECT id, title, slug, article_type, hero_image_url, summary, tags,
             attribution, source_url, source_platform, is_published, is_featured,
             featured_order, published_at, created_at, updated_at
      FROM news_articles
      WHERE is_published = true
      ORDER BY published_at DESC
      LIMIT ${limit}
    `;
    return rows.map(rowToNewsArticleSummary);
  } catch {
    return [];
  }
}

/**
 * Get featured published news articles ordered by featured_order ASC.
 */
export async function getFeaturedNewsArticles(
  limit: number = 3
): Promise<NewsArticleSummary[]> {
  try {
    const { rows } = await sql<Omit<NewsArticleRow, "body_content">>`
      SELECT id, title, slug, article_type, hero_image_url, summary, tags,
             attribution, source_url, source_platform, is_published, is_featured,
             featured_order, published_at, created_at, updated_at
      FROM news_articles
      WHERE is_published = true AND is_featured = true
      ORDER BY featured_order ASC NULLS LAST
      LIMIT ${limit}
    `;
    return rows.map(rowToNewsArticleSummary);
  } catch {
    return [];
  }
}

/**
 * Get a single published news article by slug.
 */
export async function getNewsArticle(
  slug: string
): Promise<NewsArticle | null> {
  try {
    const { rows } = await sql<NewsArticleRow>`
      SELECT id, title, slug, article_type, hero_image_url, summary, body_content,
             tags, attribution, source_url, source_platform, is_published, is_featured,
             featured_order, published_at, created_at, updated_at
      FROM news_articles
      WHERE slug = ${slug} AND is_published = true
    `;
    if (rows.length === 0) return null;
    return rowToNewsArticle(rows[0]);
  } catch {
    return null;
  }
}

/**
 * Get paginated news archive with cursor-based pagination on published_at.
 */
export async function getNewsArchive(
  cursor?: string,
  limit: number = 12
): Promise<{ articles: NewsArticleSummary[]; nextCursor: string | null }> {
  try {
    const fetchLimit = limit + 1;
    let rows: Omit<NewsArticleRow, "body_content">[];

    if (cursor) {
      const result = await sql<Omit<NewsArticleRow, "body_content">>`
        SELECT id, title, slug, article_type, hero_image_url, summary, tags,
               attribution, source_url, source_platform, is_published, is_featured,
               featured_order, published_at, created_at, updated_at
        FROM news_articles
        WHERE is_published = true AND published_at < ${cursor}
        ORDER BY published_at DESC
        LIMIT ${fetchLimit}
      `;
      rows = result.rows;
    } else {
      const result = await sql<Omit<NewsArticleRow, "body_content">>`
        SELECT id, title, slug, article_type, hero_image_url, summary, tags,
               attribution, source_url, source_platform, is_published, is_featured,
               featured_order, published_at, created_at, updated_at
        FROM news_articles
        WHERE is_published = true
        ORDER BY published_at DESC
        LIMIT ${fetchLimit}
      `;
      rows = result.rows;
    }

    let nextCursor: string | null = null;
    if (rows.length > limit) {
      const last = rows.pop()!;
      nextCursor = last.published_at ? new Date(last.published_at).toISOString() : null;
    }

    return {
      articles: rows.map(rowToNewsArticleSummary),
      nextCursor,
    };
  } catch {
    return { articles: [], nextCursor: null };
  }
}
