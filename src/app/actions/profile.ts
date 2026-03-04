"use server";

import { sql } from "@vercel/postgres";
import { getSession } from "@/lib/auth/session";

/** Reader profile stats (Req 18.3). */
export interface ReaderProfileStats {
  chaptersRead: number;
  hoursReadEstimate: number;
  rosesSent: number;
  authorsFollowed: number;
}

/** Library novel item for Currently Reading or Finished sections. */
export interface LibraryNovelItem {
  novelId: string;
  title: string;
  authorName: string;
  coverImageUrl: string | null;
  chapterNumber: number;
  chapterTitle: string;
  scrollPercent: number;
  chapterId: string;
  isFinished: boolean;
}

/** Followed author for strip (avatar + link to Author's Study). */
export interface FollowedAuthorItem {
  id: string;
  name: string;
  avatarUrl: string | null;
}

/**
 * Get reader profile stats: chapters read, hours read estimate, roses sent, authors followed.
 * Req 18.3: derived from Reading_Progress, Chapter_Unlock, Credit_Transactions, Author_Follow.
 */
export async function getReaderProfileStats(
  readerId: string
): Promise<ReaderProfileStats> {
  try {
    const [chaptersResult, rosesResult, authorsResult] = await Promise.all([
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count
        FROM reading_progress
        WHERE reader_id = ${readerId} AND scroll_percent >= 100
      `,
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count
        FROM credit_transactions
        WHERE reader_id = ${readerId} AND transaction_type = 'endorsement'
      `,
      sql<{ count: string }>`
        SELECT COUNT(*)::text AS count
        FROM author_follows
        WHERE reader_id = ${readerId}
      `,
    ]);

    const chaptersRead = parseInt(chaptersResult.rows[0]?.count ?? "0", 10);
    const rosesSent = parseInt(rosesResult.rows[0]?.count ?? "0", 10);
    const authorsFollowed = parseInt(authorsResult.rows[0]?.count ?? "0", 10);
    // Estimate ~5 min per chapter for "hours read"
    const hoursReadEstimate = Math.round((chaptersRead * 5) / 60);

    return {
      chaptersRead,
      hoursReadEstimate,
      rosesSent,
      authorsFollowed,
    };
  } catch {
    return {
      chaptersRead: 0,
      hoursReadEstimate: 0,
      rosesSent: 0,
      authorsFollowed: 0,
    };
  }
}

/**
 * Get "Currently Reading" list: novels with scroll_percent > 0 and < 100,
 * ordered by last_read_at descending. Req 18.4.
 */
export async function getCurrentlyReadingList(
  readerId: string
): Promise<LibraryNovelItem[]> {
  try {
    const { rows } = await sql<
      {
        novel_id: string;
        title: string;
        author_name: string;
        cover_image_url: string | null;
        chapter_number: number;
        chapter_title: string;
        scroll_percent: number;
        chapter_id: string;
      }
    >`
      WITH latest_per_novel AS (
        SELECT rp.chapter_id, rp.scroll_percent, rp.last_read_at,
               c.novel_id, c.chapter_number, c.title AS chapter_title
        FROM reading_progress rp
        JOIN chapters c ON c.id = rp.chapter_id
        WHERE rp.reader_id = ${readerId}
          AND rp.scroll_percent > 0 AND rp.scroll_percent < 100
      ),
      ranked AS (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY novel_id ORDER BY last_read_at DESC) AS rn
        FROM latest_per_novel
      )
      SELECT n.id AS novel_id, n.title, n.cover_image_url,
             COALESCE(a.name, 'Unknown') AS author_name,
             r.chapter_number, r.chapter_title, r.scroll_percent, r.chapter_id
      FROM ranked r
      JOIN novels n ON n.id = r.novel_id
      LEFT JOIN author_profiles a ON a.id = n.author_id
      WHERE r.rn = 1
      ORDER BY r.last_read_at DESC
    `;

    return rows.map((r) => ({
      novelId: r.novel_id,
      title: r.title,
      authorName: r.author_name,
      coverImageUrl: r.cover_image_url,
      chapterNumber: r.chapter_number,
      chapterTitle: r.chapter_title,
      scrollPercent: Number(r.scroll_percent),
      chapterId: r.chapter_id,
      isFinished: false,
    }));
  } catch {
    return [];
  }
}

/**
 * Get "Finished" list: novels where all chapters have scroll_percent = 100,
 * ordered by most recently completed. Req 18.5.
 */
export async function getFinishedList(
  readerId: string
): Promise<LibraryNovelItem[]> {
  try {
    const { rows } = await sql<
      {
        novel_id: string;
        title: string;
        author_name: string;
        cover_image_url: string | null;
        chapter_number: number;
        chapter_title: string;
        chapter_id: string;
      }
    >`
      WITH novel_chapter_count AS (
        SELECT novel_id, COUNT(*) AS total
        FROM chapters GROUP BY novel_id
      ),
      reader_completed AS (
        SELECT c.novel_id, COUNT(*) AS completed
        FROM reading_progress rp
        JOIN chapters c ON c.id = rp.chapter_id
        WHERE rp.reader_id = ${readerId} AND rp.scroll_percent >= 100
        GROUP BY c.novel_id
      ),
      finished_novels AS (
        SELECT ncc.novel_id
        FROM novel_chapter_count ncc
        JOIN reader_completed rc ON rc.novel_id = ncc.novel_id
        WHERE rc.completed >= ncc.total
      ),
      last_read_per_novel AS (
        SELECT rp.chapter_id, rp.last_read_at, c.novel_id, c.chapter_number, c.title AS chapter_title,
               ROW_NUMBER() OVER (PARTITION BY c.novel_id ORDER BY rp.last_read_at DESC) AS rn
        FROM reading_progress rp
        JOIN chapters c ON c.id = rp.chapter_id
        WHERE rp.reader_id = ${readerId} AND rp.scroll_percent >= 100
      )
      SELECT n.id AS novel_id, n.title, n.cover_image_url,
             COALESCE(a.name, 'Unknown') AS author_name,
             lr.chapter_number, lr.chapter_title, lr.chapter_id
      FROM finished_novels fn
      JOIN novels n ON n.id = fn.novel_id
      LEFT JOIN author_profiles a ON a.id = n.author_id
      JOIN last_read_per_novel lr ON lr.novel_id = fn.novel_id AND lr.rn = 1
      ORDER BY lr.last_read_at DESC
    `;

    return rows.map((r) => ({
      novelId: r.novel_id,
      title: r.title,
      authorName: r.author_name,
      coverImageUrl: r.cover_image_url,
      chapterNumber: r.chapter_number,
      chapterTitle: r.chapter_title,
      scrollPercent: 100,
      chapterId: r.chapter_id,
      isFinished: true,
    }));
  } catch {
    return [];
  }
}

/**
 * Get followed authors for the horizontal strip. Req 18.7.
 */
export async function getFollowedAuthors(
  readerId: string
): Promise<FollowedAuthorItem[]> {
  try {
    const { rows } = await sql<{
      id: string;
      name: string;
      avatar_url: string | null;
    }>`
      SELECT a.id, a.name, a.avatar_url
      FROM author_follows af
      JOIN author_profiles a ON a.id = af.author_id
      WHERE af.reader_id = ${readerId}
      ORDER BY af.followed_at DESC
    `;

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      avatarUrl: r.avatar_url,
    }));
  } catch {
    return [];
  }
}

/** Get all profile data for the current reader. Returns null if not authenticated. */
export async function getProfileData() {
  const session = await getSession();
  if (!session) return null;

  const [stats, currentlyReading, finished, followedAuthors] = await Promise.all([
    getReaderProfileStats(session.readerId),
    getCurrentlyReadingList(session.readerId),
    getFinishedList(session.readerId),
    getFollowedAuthors(session.readerId),
  ]);

  return {
    stats,
    currentlyReading,
    finished,
    followedAuthors,
  };
}
