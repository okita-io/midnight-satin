/**
 * MCP Data Layer
 * Create, list, and update operations for Author_Profiles, Series, Novels, Chapters, Characters.
 * Requirements: 12.1-12.8
 */
/* eslint-disable @typescript-eslint/no-explicit-any -- sql params may include arrays; pg supports them at runtime */

import { sql } from "@/lib/db/postgres";
import type {
  AuthorProfile,
  Series,
  Novel,
  Chapter,
  Character,
  CharacterStats,
} from "@/lib/db/types";

/** MCP error codes per design doc */
export type MCPErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "INTERNAL_ERROR";

export interface MCPError {
  code: MCPErrorCode;
  message: string;
  details?: Record<string, string>;
}

/** Create author params (Req 12.1) */
export interface CreateAuthorParams {
  name: string;
  biography?: string;
  avatar_url?: string;
  style_tags?: string[];
}

/** Create series params (Req 12.2) */
export interface CreateSeriesParams {
  title: string;
  author_id: string;
  description?: string;
  genre_tags?: string[];
}

/** Create novel params (Req 12.3) - series_id optional for standalone */
export interface CreateNovelParams {
  title: string;
  series_id?: string;
  author_id: string;
  cover_image_url?: string;
  synopsis?: string;
  genre_tags?: string[];
}

/** Create chapter params (Req 12.4) */
export interface CreateChapterParams {
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_free?: boolean;
}

/** Create character params (Req 12.5) */
export interface CreateCharacterParams {
  novel_id: string;
  name: string;
  role?: string;
  portrait_url?: string;
  description?: string;
  backstory?: string;
  stats?: CharacterStats;
  secrets?: string[];
}

/** List content type (Req 12.6) */
export type ListContentType = "authors" | "series" | "novels" | "chapters" | "characters";

export interface ListContentParams {
  type: ListContentType;
  filter_by?: { author_id?: string; series_id?: string; novel_id?: string };
}

/** Content item for list response */
export type ContentItem =
  | (AuthorProfile & { type: "author" })
  | (Series & { type: "series" })
  | (Novel & { type: "novel" })
  | (Chapter & { type: "chapter" })
  | (Character & { type: "character" });

/** Update content params (Req 12.7) */
export interface UpdateContentParams {
  type: ListContentType;
  id: string;
  updates: Record<string, unknown>;
}

function validationError(message: string, details?: Record<string, string>): MCPError {
  return { code: "VALIDATION_ERROR", message, details };
}

function notFoundError(message: string): MCPError {
  return { code: "NOT_FOUND", message };
}

/** Create Author_Profile (Req 12.1) */
export async function createAuthor(
  params: CreateAuthorParams
): Promise<{ id: string } | MCPError> {
  if (!params.name?.trim()) {
    return validationError("name is required", { name: "name is required" });
  }
  try {
    const styleTags = Array.isArray(params.style_tags) ? params.style_tags : [];
    const { rows } = await sql<{ id: string }>`
      INSERT INTO author_profiles (name, avatar_url, biography, style_tags)
      VALUES (
        ${params.name.trim()},
        ${params.avatar_url ?? null},
        ${params.biography ?? null},
        ${styleTags as any}
      )
      RETURNING id
    `;
    return { id: rows[0].id };
  } catch (err) {
    return {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Failed to create author",
    };
  }
}

/** Create Series (Req 12.2) */
export async function createSeries(
  params: CreateSeriesParams
): Promise<{ id: string } | MCPError> {
  if (!params.title?.trim()) {
    return validationError("title is required", { title: "title is required" });
  }
  if (!params.author_id) {
    return validationError("author_id is required", { author_id: "author_id is required" });
  }
  try {
    const { rows: authorRows } = await sql<{ id: string }>`
      SELECT id FROM author_profiles WHERE id = ${params.author_id}
    `;
    if (authorRows.length === 0) {
      return validationError("author_id not found", { author_id: "Author does not exist" });
    }
    const genreTags = Array.isArray(params.genre_tags) ? params.genre_tags : [];
    const { rows } = await sql<{ id: string }>`
      INSERT INTO series (title, author_id, description, genre_tags)
      VALUES (
        ${params.title.trim()},
        ${params.author_id},
        ${params.description ?? null},
        ${genreTags as any}
      )
      RETURNING id
    `;
    return { id: rows[0].id };
  } catch (err) {
    return {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Failed to create series",
    };
  }
}

/** Create Novel (Req 12.3) */
export async function createNovel(
  params: CreateNovelParams
): Promise<{ id: string } | MCPError> {
  if (!params.title?.trim()) {
    return validationError("title is required", { title: "title is required" });
  }
  if (!params.author_id) {
    return validationError("author_id is required", { author_id: "author_id is required" });
  }
  try {
    const { rows: authorRows } = await sql<{ id: string }>`
      SELECT id FROM author_profiles WHERE id = ${params.author_id}
    `;
    if (authorRows.length === 0) {
      return validationError("author_id not found", { author_id: "Author does not exist" });
    }
    if (params.series_id) {
      const { rows: seriesRows } = await sql<{ id: string }>`
        SELECT id FROM series WHERE id = ${params.series_id}
      `;
      if (seriesRows.length === 0) {
        return validationError("series_id not found", { series_id: "Series does not exist" });
      }
    }
    const genreTags = Array.isArray(params.genre_tags) ? params.genre_tags : [];
    const { rows } = await sql<{ id: string }>`
      INSERT INTO novels (title, series_id, author_id, cover_image_url, synopsis, genre_tags)
      VALUES (
        ${params.title.trim()},
        ${params.series_id ?? null},
        ${params.author_id},
        ${params.cover_image_url ?? null},
        ${params.synopsis ?? null},
        ${genreTags as any}
      )
      RETURNING id
    `;
    return { id: rows[0].id };
  } catch (err) {
    return {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Failed to create novel",
    };
  }
}

/** Create Chapter (Req 12.4) */
export async function createChapter(
  params: CreateChapterParams
): Promise<{ id: string } | MCPError> {
  if (!params.novel_id) {
    return validationError("novel_id is required", { novel_id: "novel_id is required" });
  }
  if (typeof params.chapter_number !== "number" || params.chapter_number < 1) {
    return validationError("chapter_number must be a positive integer", {
      chapter_number: "chapter_number must be >= 1",
    });
  }
  if (!params.title?.trim()) {
    return validationError("title is required", { title: "title is required" });
  }
  if (params.content === undefined || params.content === null) {
    return validationError("content is required", { content: "content is required" });
  }
  try {
    const { rows: novelRows } = await sql<{ id: string }>`
      SELECT id FROM novels WHERE id = ${params.novel_id}
    `;
    if (novelRows.length === 0) {
      return validationError("novel_id not found", { novel_id: "Novel does not exist" });
    }
    const { rows } = await sql<{ id: string }>`
      INSERT INTO chapters (novel_id, chapter_number, title, content, is_free)
      VALUES (
        ${params.novel_id},
        ${params.chapter_number},
        ${params.title.trim()},
        ${String(params.content)},
        ${params.is_free ?? false}
      )
      RETURNING id
    `;
    return { id: rows[0].id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to create chapter";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return validationError(
        "Chapter number already exists for this novel",
        { chapter_number: "Duplicate chapter_number for novel" }
      );
    }
    return { code: "INTERNAL_ERROR", message: msg };
  }
}

/** Create Character (Req 12.5) */
export async function createCharacter(
  params: CreateCharacterParams
): Promise<{ id: string } | MCPError> {
  if (!params.novel_id) {
    return validationError("novel_id is required", { novel_id: "novel_id is required" });
  }
  if (!params.name?.trim()) {
    return validationError("name is required", { name: "name is required" });
  }
  try {
    const { rows: novelRows } = await sql<{ id: string }>`
      SELECT id FROM novels WHERE id = ${params.novel_id}
    `;
    if (novelRows.length === 0) {
      return validationError("novel_id not found", { novel_id: "Novel does not exist" });
    }
    const stats = params.stats && typeof params.stats === "object" ? params.stats : {};
    const secrets = Array.isArray(params.secrets) ? params.secrets : [];
    const { rows } = await sql<{ id: string }>`
      INSERT INTO characters (novel_id, name, role_subtitle, portrait_url, description, backstory, stats, secrets)
      VALUES (
        ${params.novel_id},
        ${params.name.trim()},
        ${params.role ?? null},
        ${params.portrait_url ?? null},
        ${params.description ?? null},
        ${params.backstory ?? null},
        ${JSON.stringify(stats)},
        ${secrets as any}
      )
      RETURNING id
    `;
    return { id: rows[0].id };
  } catch (err) {
    return {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Failed to create character",
    };
  }
}

/** List content with optional filters (Req 12.6) */
export async function listContent(
  params: ListContentParams
): Promise<ContentItem[] | MCPError> {
  try {
    switch (params.type) {
      case "authors": {
        const { rows } = await sql<{
          id: string;
          name: string;
          avatar_url: string | null;
          biography: string | null;
          style_tags: string[];
          follower_count: number;
          created_at: Date;
        }>`
          SELECT id, name, avatar_url, biography, style_tags, follower_count, created_at
          FROM author_profiles
          ORDER BY created_at DESC
        `;
        return rows.map((r) => ({
          type: "author" as const,
          id: r.id,
          name: r.name,
          avatarUrl: r.avatar_url,
          biography: r.biography,
          styleTags: Array.isArray(r.style_tags) ? r.style_tags : [],
          followerCount: Number(r.follower_count),
          createdAt: new Date(r.created_at),
        }));
      }
      case "series": {
        let query;
        if (params.filter_by?.author_id) {
          query = sql<{
            id: string;
            title: string;
            author_id: string;
            description: string | null;
            genre_tags: string[];
            is_complete: boolean;
            created_at: Date;
          }>`
            SELECT id, title, author_id, description, genre_tags, is_complete, created_at
            FROM series
            WHERE author_id = ${params.filter_by.author_id}
            ORDER BY created_at DESC
          `;
        } else {
          query = sql<{
            id: string;
            title: string;
            author_id: string;
            description: string | null;
            genre_tags: string[];
            is_complete: boolean;
            created_at: Date;
          }>`
            SELECT id, title, author_id, description, genre_tags, is_complete, created_at
            FROM series
            ORDER BY created_at DESC
          `;
        }
        const { rows } = await query;
        return rows.map((r) => ({
          type: "series" as const,
          id: r.id,
          title: r.title,
          authorId: r.author_id,
          description: r.description,
          genreTags: Array.isArray(r.genre_tags) ? r.genre_tags : [],
          isComplete: Boolean(r.is_complete),
          createdAt: new Date(r.created_at),
        }));
      }
      case "novels": {
        let query;
        if (params.filter_by?.author_id && params.filter_by?.series_id) {
          query = sql<NovelRow>`
            SELECT id, title, series_id, author_id, cover_image_url, synopsis, genre_tags,
                   rating, rating_count, publication_date, is_featured, featured_order, created_at
            FROM novels
            WHERE author_id = ${params.filter_by.author_id} AND series_id = ${params.filter_by.series_id}
            ORDER BY created_at DESC
          `;
        } else if (params.filter_by?.author_id) {
          query = sql<NovelRow>`
            SELECT id, title, series_id, author_id, cover_image_url, synopsis, genre_tags,
                   rating, rating_count, publication_date, is_featured, featured_order, created_at
            FROM novels
            WHERE author_id = ${params.filter_by.author_id}
            ORDER BY created_at DESC
          `;
        } else if (params.filter_by?.series_id) {
          query = sql<NovelRow>`
            SELECT id, title, series_id, author_id, cover_image_url, synopsis, genre_tags,
                   rating, rating_count, publication_date, is_featured, featured_order, created_at
            FROM novels
            WHERE series_id = ${params.filter_by.series_id}
            ORDER BY created_at DESC
          `;
        } else {
          query = sql<NovelRow>`
            SELECT id, title, series_id, author_id, cover_image_url, synopsis, genre_tags,
                   rating, rating_count, publication_date, is_featured, featured_order, created_at
            FROM novels
            ORDER BY created_at DESC
          `;
        }
        const { rows } = await query;
        return rows.map((r) => ({
          type: "novel" as const,
          id: r.id,
          title: r.title,
          seriesId: r.series_id,
          authorId: r.author_id,
          coverImageUrl: r.cover_image_url,
          synopsis: r.synopsis,
          genreTags: Array.isArray(r.genre_tags) ? r.genre_tags : [],
          rating: Number(r.rating ?? 0),
          ratingCount: Number(r.rating_count ?? 0),
          publicationDate: r.publication_date ? new Date(r.publication_date) : null,
          isFeatured: Boolean(r.is_featured),
          featuredOrder: r.featured_order != null ? Number(r.featured_order) : null,
          createdAt: new Date(r.created_at),
        }));
      }
      case "chapters": {
        let query;
        if (params.filter_by?.novel_id) {
          query = sql<ChapterRow>`
            SELECT id, novel_id, chapter_number, title, content, is_free, created_at, updated_at
            FROM chapters
            WHERE novel_id = ${params.filter_by.novel_id}
            ORDER BY chapter_number ASC
          `;
        } else {
          query = sql<ChapterRow>`
            SELECT id, novel_id, chapter_number, title, content, is_free, created_at, updated_at
            FROM chapters
            ORDER BY novel_id, chapter_number ASC
          `;
        }
        const { rows } = await query;
        return rows.map((r) => ({
          type: "chapter" as const,
          id: r.id,
          novelId: r.novel_id,
          chapterNumber: r.chapter_number,
          title: r.title,
          content: r.content,
          isFree: Boolean(r.is_free),
          createdAt: new Date(r.created_at),
          updatedAt: new Date(r.updated_at),
        }));
      }
      case "characters": {
        let query;
        if (params.filter_by?.novel_id) {
          query = sql<CharacterRow>`
            SELECT id, novel_id, name, role_subtitle, portrait_url, description, backstory,
                   stats, secrets, endorsement_count, has_trophy, created_at
            FROM characters
            WHERE novel_id = ${params.filter_by.novel_id}
            ORDER BY created_at ASC
          `;
        } else if (params.filter_by?.author_id) {
          query = sql<CharacterRow>`
            SELECT c.id, c.novel_id, c.name, c.role_subtitle, c.portrait_url, c.description,
                   c.backstory, c.stats, c.secrets, c.endorsement_count, c.has_trophy, c.created_at
            FROM characters c
            JOIN novels n ON n.id = c.novel_id
            WHERE n.author_id = ${params.filter_by.author_id}
            ORDER BY c.created_at ASC
          `;
        } else {
          query = sql<CharacterRow>`
            SELECT id, novel_id, name, role_subtitle, portrait_url, description, backstory,
                   stats, secrets, endorsement_count, has_trophy, created_at
            FROM characters
            ORDER BY created_at ASC
          `;
        }
        const { rows } = await query;
        return rows.map((r) => ({
          type: "character" as const,
          id: r.id,
          novelId: r.novel_id,
          name: r.name,
          roleSubtitle: r.role_subtitle,
          portraitUrl: r.portrait_url,
          description: r.description,
          backstory: r.backstory,
          stats: (r.stats as CharacterStats) ?? {},
          secrets: Array.isArray(r.secrets) ? r.secrets : [],
          endorsementCount: Number(r.endorsement_count ?? 0),
          hasTrophy: Boolean(r.has_trophy),
          createdAt: new Date(r.created_at),
        }));
      }
      default:
        return validationError(`Invalid type: ${params.type}`, {
          type: `Must be one of: authors, series, novels, chapters, characters`,
        });
    }
  } catch (err) {
    return {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Failed to list content",
    };
  }
}

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
  is_featured: boolean;
  featured_order: number | null;
  created_at: Date;
}

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

/** Map input keys to DB column names */
const KEY_TO_DB: Record<string, string> = {
  name: "name",
  avatar_url: "avatar_url",
  avatarUrl: "avatar_url",
  biography: "biography",
  style_tags: "style_tags",
  styleTags: "style_tags",
  title: "title",
  description: "description",
  genre_tags: "genre_tags",
  genreTags: "genre_tags",
  is_complete: "is_complete",
  isComplete: "is_complete",
  series_id: "series_id",
  seriesId: "series_id",
  cover_image_url: "cover_image_url",
  coverImageUrl: "cover_image_url",
  synopsis: "synopsis",
  publication_date: "publication_date",
  publicationDate: "publication_date",
  is_featured: "is_featured",
  featured_order: "featured_order",
  content: "content",
  is_free: "is_free",
  isFree: "is_free",
  role: "role_subtitle",
  role_subtitle: "role_subtitle",
  roleSubtitle: "role_subtitle",
  portrait_url: "portrait_url",
  portraitUrl: "portrait_url",
  backstory: "backstory",
  stats: "stats",
  secrets: "secrets",
};

/** Update content by id (Req 12.7) - uses parameterized query for dynamic updates */
export async function updateContent(
  params: UpdateContentParams
): Promise<{ success: boolean } | MCPError> {
  const typeConfig: Record<
    ListContentType,
    { table: string; allowed: string[] }
  > = {
    authors: {
      table: "author_profiles",
      allowed: ["name", "avatar_url", "biography", "style_tags"],
    },
    series: {
      table: "series",
      allowed: ["title", "description", "genre_tags", "is_complete"],
    },
    novels: {
      table: "novels",
      allowed: ["title", "series_id", "cover_image_url", "synopsis", "genre_tags", "publication_date", "is_featured", "featured_order"],
    },
    chapters: {
      table: "chapters",
      allowed: ["title", "content", "is_free"],
    },
    characters: {
      table: "characters",
      allowed: ["name", "role_subtitle", "portrait_url", "description", "backstory", "stats", "secrets"],
    },
  };

  const config = typeConfig[params.type];
  if (!config) {
    return validationError(`Invalid type: ${params.type}`);
  }

  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params.updates)) {
    const dbKey = KEY_TO_DB[key] ?? key;
    if (config.allowed.includes(dbKey) && value !== undefined) {
      if (dbKey === "stats" && value !== null && typeof value === "object") {
        updates[dbKey] = JSON.stringify(value);
      } else if (["style_tags", "genre_tags", "secrets"].includes(dbKey)) {
        updates[dbKey] = Array.isArray(value) ? value : [];
      } else if (dbKey === "publication_date" && value) {
        updates[dbKey] = typeof value === "string" ? value : (value as Date).toISOString().slice(0, 10);
      } else {
        updates[dbKey] = value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    return validationError("No valid updates provided", {
      updates: "Must include at least one allowed field",
    });
  }

  try {
    const columns = Object.keys(updates);
    const setClause = columns.map((c, i) => `${c} = $${i + 1}`).join(", ");
    const values = columns.map((c) => updates[c]);
    values.push(params.id);
    const query = `UPDATE ${config.table} SET ${setClause}${params.type === "chapters" ? ", updated_at = NOW()" : ""} WHERE id = $${values.length}`;
    const pool = sql as { query: (text: string, values: unknown[]) => Promise<{ rowCount: number }> };
    const result = await pool.query(query, values);

    if (result.rowCount === 0) {
      return notFoundError(`${params.type} with id ${params.id} not found`);
    }
    return { success: true };
  } catch (err) {
    return {
      code: "INTERNAL_ERROR",
      message: err instanceof Error ? err.message : "Failed to update content",
    };
  }
}
