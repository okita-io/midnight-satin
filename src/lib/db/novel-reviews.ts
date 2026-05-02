/**
 * Novel reviews — Postgres layer (novel detail + full reviews page).
 * Preview list: highest helpful count first, then recency.
 */

import { sql } from "@vercel/postgres";
import type { NovelReview } from "./types";

export interface NovelReviewWithAuthor extends NovelReview {
  readerDisplayName: string | null;
}

export interface NovelReviewAggregate {
  /** Rounded to one decimal for display (0 when no reviews). */
  averageRating: number;
  reviewCount: number;
}

interface NovelReviewDbRow {
  id: string;
  novel_id: string;
  reader_id: string;
  content: string;
  star_rating: number;
  like_count: number;
  created_at: Date;
  updated_at: Date;
  display_name?: string | null;
}

function rowToNovelReview(row: NovelReviewDbRow): NovelReviewWithAuthor {
  return {
    id: row.id,
    novelId: row.novel_id,
    readerId: row.reader_id,
    content: row.content,
    starRating: Number(row.star_rating ?? 5),
    likeCount: Number(row.like_count ?? 0),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    readerDisplayName: row.display_name ?? null,
  };
}

function isMissingReviewsTableError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  if (/42P01/.test(msg)) return true;
  return /novel_reviews/i.test(msg) && /does not exist|relation/i.test(msg);
}

function isMissingStarRatingColumn(err: unknown): boolean {
  const o = err as { code?: string; message?: string };
  if (o?.code === "42703") return true;
  const msg = o?.message ?? String(err);
  return /star_rating/i.test(msg) && /does not exist|undefined_column/i.test(msg);
}

/**
 * Average star rating and count from reader reviews (for novel cover).
 */
export async function getNovelReviewAggregateDb(
  novelId: string
): Promise<NovelReviewAggregate> {
  try {
    const { rows } = await sql<{ avg: string | null; cnt: string | null }>`
      SELECT AVG(star_rating)::text AS avg, COUNT(*)::text AS cnt
      FROM novel_reviews
      WHERE novel_id = ${novelId}
    `;
    const r = rows[0];
    const reviewCount = parseInt(r?.cnt ?? "0", 10);
    if (reviewCount === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const raw = parseFloat(r?.avg ?? "0");
    const averageRating = Math.round(raw * 10) / 10;
    return { averageRating, reviewCount };
  } catch (e) {
    if (isMissingReviewsTableError(e) || isMissingStarRatingColumn(e)) {
      return { averageRating: 0, reviewCount: 0 };
    }
    throw e;
  }
}

/**
 * Top reviews for novel detail: by helpful likes, then recency.
 */
export async function listNovelReviewsPreviewDb(
  novelId: string,
  limit: number = 5
): Promise<NovelReviewWithAuthor[]> {
  const cap = Math.min(Math.max(1, limit), 20);
  try {
    const { rows } = await sql<NovelReviewDbRow>`
      SELECT nr.id, nr.novel_id, nr.reader_id, nr.content, nr.star_rating, nr.like_count,
             nr.created_at, nr.updated_at, r.display_name
      FROM novel_reviews nr
      JOIN readers r ON r.id = nr.reader_id
      WHERE nr.novel_id = ${novelId}
      ORDER BY nr.like_count DESC, nr.created_at DESC
      LIMIT ${cap}
    `;
    return rows.map(rowToNovelReview);
  } catch (e) {
    if (isMissingReviewsTableError(e) || isMissingStarRatingColumn(e)) return [];
    throw e;
  }
}

export async function listNovelReviewsAllDb(
  novelId: string,
  limit: number = 100
): Promise<NovelReviewWithAuthor[]> {
  const cap = Math.min(Math.max(1, limit), 200);
  try {
    const { rows } = await sql<NovelReviewDbRow>`
      SELECT nr.id, nr.novel_id, nr.reader_id, nr.content, nr.star_rating, nr.like_count,
             nr.created_at, nr.updated_at, r.display_name
      FROM novel_reviews nr
      JOIN readers r ON r.id = nr.reader_id
      WHERE nr.novel_id = ${novelId}
      ORDER BY nr.like_count DESC, nr.created_at DESC
      LIMIT ${cap}
    `;
    return rows.map(rowToNovelReview);
  } catch (e) {
    if (isMissingReviewsTableError(e) || isMissingStarRatingColumn(e)) return [];
    throw e;
  }
}

export async function getReaderNovelReviewDb(
  novelId: string,
  readerId: string
): Promise<NovelReview | null> {
  try {
    const { rows } = await sql<{
      id: string;
      novel_id: string;
      reader_id: string;
      content: string;
      star_rating: number;
      like_count: number;
      created_at: Date;
      updated_at: Date;
    }>`
      SELECT id, novel_id, reader_id, content, star_rating, like_count, created_at, updated_at
      FROM novel_reviews
      WHERE novel_id = ${novelId} AND reader_id = ${readerId}
      LIMIT 1
    `;
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      novelId: r.novel_id,
      readerId: r.reader_id,
      content: r.content,
      starRating: Number(r.star_rating ?? 5),
      likeCount: Number(r.like_count ?? 0),
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    };
  } catch (e) {
    if (isMissingReviewsTableError(e) || isMissingStarRatingColumn(e)) return null;
    throw e;
  }
}

export async function insertNovelReviewDb(
  novelId: string,
  readerId: string,
  content: string,
  starRating: number
): Promise<NovelReview> {
  const { rows } = await sql<{
    id: string;
    novel_id: string;
    reader_id: string;
    content: string;
    star_rating: number;
    like_count: number;
    created_at: Date;
    updated_at: Date;
  }>`
    INSERT INTO novel_reviews (novel_id, reader_id, content, star_rating)
    VALUES (${novelId}, ${readerId}, ${content}, ${starRating})
    RETURNING id, novel_id, reader_id, content, star_rating, like_count, created_at, updated_at
  `;
  const r = rows[0];
  if (!r) throw new Error("Failed to insert novel review");
  return {
    id: r.id,
    novelId: r.novel_id,
    readerId: r.reader_id,
    content: r.content,
    starRating: Number(r.star_rating ?? 5),
    likeCount: Number(r.like_count ?? 0),
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

export async function updateNovelReviewDb(
  reviewId: string,
  readerId: string,
  content: string,
  starRating: number
): Promise<NovelReview> {
  const { rows } = await sql<{
    id: string;
    novel_id: string;
    reader_id: string;
    content: string;
    star_rating: number;
    like_count: number;
    created_at: Date;
    updated_at: Date;
  }>`
    UPDATE novel_reviews
    SET content = ${content}, star_rating = ${starRating}, updated_at = NOW()
    WHERE id = ${reviewId} AND reader_id = ${readerId}
    RETURNING id, novel_id, reader_id, content, star_rating, like_count, created_at, updated_at
  `;
  const r = rows[0];
  if (!r) throw new Error("Review not found or not owned by reader");
  return {
    id: r.id,
    novelId: r.novel_id,
    readerId: r.reader_id,
    content: r.content,
    starRating: Number(r.star_rating ?? 5),
    likeCount: Number(r.like_count ?? 0),
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  };
}

/** Deletes the review if owned by reader. `review_likes` rows cascade. */
export async function deleteNovelReviewDb(
  reviewId: string,
  readerId: string
): Promise<boolean> {
  const { rows } = await sql<{ id: string }>`
    DELETE FROM novel_reviews
    WHERE id = ${reviewId} AND reader_id = ${readerId}
    RETURNING id
  `;
  return rows.length > 0;
}
