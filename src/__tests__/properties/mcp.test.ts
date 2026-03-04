/**
 * Property 19: MCP content creation round-trip
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5
 *
 * For any valid MCP tool input (create_author, create_series, create_novel,
 * create_chapter, create_character), calling the create tool and then listing
 * content should include the newly created record with all input fields preserved.
 *
 * Property 20: MCP content filtering
 * Validates: Requirements 12.6
 *
 * For any set of content records and any filter (by author_id or series_id),
 * the list_content tool should return only records matching the filter criteria.
 * The result set should be a subset of the unfiltered result set.
 *
 * Property 21: MCP content update
 * Validates: Requirements 12.7
 *
 * For any existing content record and any valid partial update, calling
 * update_content and then retrieving the record should show the updated fields
 * with new values while preserving all non-updated fields.
 *
 * Property 22: MCP input validation
 * Validates: Requirements 12.8
 *
 * For any invalid MCP tool input (missing required fields, invalid foreign key
 * references, wrong data types), the tool should return a descriptive error
 * message and not create or modify any database records.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  clearStore,
  storeEntity,
  createAuthorInStore,
  createSeriesInStore,
  createNovelInStore,
  createChapterInStore,
  createCharacterInStore,
  listContentFromStore,
  updateContentInStore,
} from "@/lib/db/store";
import type {
  AuthorProfile,
  Series,
  Novel,
  Chapter,
  Character,
  CharacterStats,
} from "@/lib/db/types";

function isMCPError(
  r: { id?: string } | { code?: string; message?: string }
): r is { code: string; message: string; details?: Record<string, string> } {
  return "code" in r && "message" in r;
}

describe("Property 19: MCP content creation round-trip", () => {
  beforeEach(() => clearStore());

  it("create_author then list: record preserved", () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        fc.option(fc.webUrl(), { nil: undefined }),
        fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 }),
        (name, biography, avatar_url, style_tags) => {
          const result = createAuthorInStore({
            name,
            biography: biography ?? undefined,
            avatar_url: avatar_url ?? undefined,
            style_tags: style_tags.length > 0 ? style_tags : undefined,
          });
          expect(isMCPError(result)).toBe(false);
          if (isMCPError(result)) return;
          const list = listContentFromStore("authors");
          const found = list.find((x) => x.type === "author" && x.id === result.id);
          expect(found).toBeDefined();
          if (found && found.type === "author") {
            expect(found.name).toBe(name.trim());
            expect(found.biography).toBe(biography ?? null);
            expect(found.avatarUrl).toBe(avatar_url ?? null);
            expect(found.styleTags).toEqual(style_tags ?? []);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("create_series then list: record preserved", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 300 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string(), { nil: undefined }),
        fc.array(fc.string({ maxLength: 50 }), { maxLength: 15 }),
        (authorId, title, description, genre_tags) => {
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

          const result = createSeriesInStore({
            title,
            author_id: authorId,
            description: description ?? undefined,
            genre_tags: genre_tags.length > 0 ? genre_tags : undefined,
          });
          expect(isMCPError(result)).toBe(false);
          if (isMCPError(result)) return;
          const list = listContentFromStore("series");
          const found = list.find((x) => x.type === "series" && x.id === result.id);
          expect(found).toBeDefined();
          if (found && found.type === "series") {
            expect(found.title).toBe(title.trim());
            expect(found.authorId).toBe(authorId);
            expect(found.description).toBe(description ?? null);
            expect(found.genreTags).toEqual(genre_tags ?? []);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("create_novel then list: record preserved", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.option(fc.uuid(), { nil: undefined }),
        fc.string({ minLength: 1, maxLength: 300 }).filter((s) => s.trim().length > 0),
        fc.option(fc.webUrl(), { nil: undefined }),
        fc.option(fc.string(), { nil: undefined }),
        fc.array(fc.string({ maxLength: 50 }), { maxLength: 15 }),
        (authorId, seriesId, title, cover_image_url, synopsis, genre_tags) => {
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
          if (seriesId) {
            const series: Series = {
              id: seriesId,
              title: "Series",
              authorId,
              description: null,
              genreTags: [],
              isComplete: false,
              createdAt: new Date(),
            };
            storeEntity(series);
          }

          const result = createNovelInStore({
            title,
            author_id: authorId,
            series_id: seriesId ?? undefined,
            cover_image_url: cover_image_url ?? undefined,
            synopsis: synopsis ?? undefined,
            genre_tags: genre_tags.length > 0 ? genre_tags : undefined,
          });
          expect(isMCPError(result)).toBe(false);
          if (isMCPError(result)) return;
          const list = listContentFromStore("novels");
          const found = list.find((x) => x.type === "novel" && x.id === result.id);
          expect(found).toBeDefined();
          if (found && found.type === "novel") {
            expect(found.title).toBe(title.trim());
            expect(found.authorId).toBe(authorId);
            expect(found.seriesId).toBe(seriesId ?? null);
            expect(found.coverImageUrl).toBe(cover_image_url ?? null);
            expect(found.synopsis).toBe(synopsis ?? null);
            expect(found.genreTags).toEqual(genre_tags ?? []);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("create_chapter then list: record preserved", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ min: 1, max: 500 }),
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        fc.string({ minLength: 1, maxLength: 3000 }).filter((s) => s.trim().length > 0),
        fc.boolean(),
        (novelId, chapter_number, title, content, is_free) => {
          const novel: Novel = {
            id: novelId,
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

          const result = createChapterInStore({
            novel_id: novelId,
            chapter_number,
            title,
            content,
            is_free,
          });
          expect(isMCPError(result)).toBe(false);
          if (isMCPError(result)) return;
          const list = listContentFromStore("chapters", { novel_id: novelId });
          const found = list.find((x) => x.type === "chapter" && x.id === result.id);
          expect(found).toBeDefined();
          if (found && found.type === "chapter") {
            expect(found.novelId).toBe(novelId);
            expect(found.chapterNumber).toBe(chapter_number);
            expect(found.title).toBe(title.trim());
            expect(found.content).toBe(String(content));
            expect(found.isFree).toBe(is_free);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("create_character then list: record preserved", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
        fc.option(fc.webUrl(), { nil: undefined }),
        fc.option(fc.string(), { nil: undefined }),
        fc.option(fc.string(), { nil: undefined }),
        fc.option(
          fc.record({
            age: fc.option(fc.string(), { nil: undefined }),
            status: fc.option(fc.string(), { nil: undefined }),
          }),
          { nil: undefined }
        ),
        fc.array(fc.string({ maxLength: 500 }), { maxLength: 10 }),
        (novelId, name, role, portrait_url, description, backstory, stats, secrets) => {
          const novel: Novel = {
            id: novelId,
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

          const result = createCharacterInStore({
            novel_id: novelId,
            name,
            role: role ?? undefined,
            portrait_url: portrait_url ?? undefined,
            description: description ?? undefined,
            backstory: backstory ?? undefined,
            stats: stats as CharacterStats | undefined,
            secrets: secrets.length > 0 ? secrets : undefined,
          });
          expect(isMCPError(result)).toBe(false);
          if (isMCPError(result)) return;
          const list = listContentFromStore("characters", { novel_id: novelId });
          const found = list.find((x) => x.type === "character" && x.id === result.id);
          expect(found).toBeDefined();
          if (found && found.type === "character") {
            expect(found.name).toBe(name.trim());
            expect(found.novelId).toBe(novelId);
            expect(found.roleSubtitle).toBe(role ?? null);
            expect(found.portraitUrl).toBe(portrait_url ?? null);
            expect(found.description).toBe(description ?? null);
            expect(found.backstory).toBe(backstory ?? null);
            expect(found.stats).toEqual(stats ?? {});
            expect(found.secrets).toEqual(secrets ?? []);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 20: MCP content filtering", () => {
  beforeEach(() => clearStore());

  it("filter by author_id: returns only matching records", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        (authorId, otherAuthorId, seriesId, count) => {
          const author: AuthorProfile = {
            id: authorId,
            name: "Author",
            avatarUrl: null,
            biography: null,
            styleTags: [],
            followerCount: 0,
            createdAt: new Date(),
          };
          const otherAuthor: AuthorProfile = {
            id: otherAuthorId,
            name: "Other",
            avatarUrl: null,
            biography: null,
            styleTags: [],
            followerCount: 0,
            createdAt: new Date(),
          };
          storeEntity(author);
          storeEntity(otherAuthor);

          const series: Series = {
            id: seriesId,
            title: "Series",
            authorId,
            description: null,
            genreTags: [],
            isComplete: false,
            createdAt: new Date(),
          };
          storeEntity(series);

          for (let i = 0; i < count; i++) {
            const novel: Novel = {
              id: crypto.randomUUID(),
              title: `Novel ${i}`,
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
            storeEntity(novel);
          }

          const novelOther: Novel = {
            id: crypto.randomUUID(),
            title: "Other Novel",
            seriesId: null,
            authorId: otherAuthorId,
            coverImageUrl: null,
            synopsis: null,
            genreTags: [],
            rating: 0,
            ratingCount: 0,
            publicationDate: null,
            createdAt: new Date(),
          };
          storeEntity(novelOther);

          const unfiltered = listContentFromStore("novels");
          const filtered = listContentFromStore("novels", {
            author_id: authorId,
          });

          expect(filtered.length).toBe(count);
          expect(filtered.length).toBeLessThanOrEqual(unfiltered.length);
          for (const n of filtered) {
            if (n.type === "novel") {
              expect(n.authorId).toBe(authorId);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("filter by series_id: returns only matching records", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        fc.integer({ min: 1, max: 10 }),
        (authorId, seriesId, otherSeriesId, count) => {
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

          const series: Series = {
            id: seriesId,
            title: "Series",
            authorId,
            description: null,
            genreTags: [],
            isComplete: false,
            createdAt: new Date(),
          };
          storeEntity(series);

          const otherSeries: Series = {
            id: otherSeriesId,
            title: "Other Series",
            authorId,
            description: null,
            genreTags: [],
            isComplete: false,
            createdAt: new Date(),
          };
          storeEntity(otherSeries);

          for (let i = 0; i < count; i++) {
            const novel: Novel = {
              id: crypto.randomUUID(),
              title: `Novel ${i}`,
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
            storeEntity(novel);
          }

          const novelOther: Novel = {
            id: crypto.randomUUID(),
            title: "Other Novel",
            seriesId: otherSeriesId,
            authorId,
            coverImageUrl: null,
            synopsis: null,
            genreTags: [],
            rating: 0,
            ratingCount: 0,
            publicationDate: null,
            createdAt: new Date(),
          };
          storeEntity(novelOther);

          const unfiltered = listContentFromStore("novels");
          const filtered = listContentFromStore("novels", {
            series_id: seriesId,
          });

          expect(filtered.length).toBe(count);
          expect(filtered.length).toBeLessThanOrEqual(unfiltered.length);
          for (const n of filtered) {
            if (n.type === "novel") {
              expect(n.seriesId).toBe(seriesId);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 21: MCP content update", () => {
  beforeEach(() => clearStore());

  it("update author: updated fields preserved, others unchanged", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        (authorId, originalName, newName) => {
          const author: AuthorProfile = {
            id: authorId,
            name: originalName,
            avatarUrl: null,
            biography: "Original bio",
            styleTags: ["romance"],
            followerCount: 0,
            createdAt: new Date(),
          };
          storeEntity(author);

          const result = updateContentInStore("authors", authorId, {
            name: newName,
          });
          expect("code" in result ? result.code : "success").toBe("success");
          if ("code" in result && result.code !== "success") return;

          const list = listContentFromStore("authors");
          const found = list.find((x) => x.type === "author" && x.id === authorId);
          expect(found).toBeDefined();
          if (found && found.type === "author") {
            expect(found.name).toBe(newName);
            expect(found.biography).toBe("Original bio");
            expect(found.styleTags).toEqual(["romance"]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("update novel: updated fields preserved, others unchanged", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 300 }),
        fc.string({ minLength: 1, maxLength: 300 }),
        (authorId, novelId, originalTitle, newTitle) => {
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

          const novel: Novel = {
            id: novelId,
            title: originalTitle,
            seriesId: null,
            authorId,
            coverImageUrl: null,
            synopsis: "Original synopsis",
            genreTags: ["drama"],
            rating: 0,
            ratingCount: 0,
            publicationDate: null,
            createdAt: new Date(),
          };
          storeEntity(novel);

          const result = updateContentInStore("novels", novelId, {
            title: newTitle,
          });
          expect("code" in result ? result.code : "success").toBe("success");
          if ("code" in result && result.code !== "success") return;

          const list = listContentFromStore("novels");
          const found = list.find((x) => x.type === "novel" && x.id === novelId);
          expect(found).toBeDefined();
          if (found && found.type === "novel") {
            expect(found.title).toBe(newTitle);
            expect(found.synopsis).toBe("Original synopsis");
            expect(found.genreTags).toEqual(["drama"]);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("update chapter: updated fields preserved, others unchanged", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.boolean(),
        fc.boolean(),
        (chapterId, originalTitle, newTitle, originalFree, newFree) => {
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

          const chapter: Chapter = {
            id: chapterId,
            novelId: novel.id,
            chapterNumber: 1,
            title: originalTitle,
            content: "Original content",
            isFree: originalFree,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          storeEntity(chapter);

          const result = updateContentInStore("chapters", chapterId, {
            title: newTitle,
            is_free: newFree,
          });
          expect("code" in result ? result.code : "success").toBe("success");
          if ("code" in result && result.code !== "success") return;

          const list = listContentFromStore("chapters", { novel_id: novel.id });
          const found = list.find((x) => x.type === "chapter" && x.id === chapterId);
          expect(found).toBeDefined();
          if (found && found.type === "chapter") {
            expect(found.title).toBe(newTitle);
            expect(found.isFree).toBe(newFree);
            expect(found.content).toBe("Original content");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Property 22: MCP input validation", () => {
  beforeEach(() => clearStore());

  it("create_author with empty name: returns validation error, no record created", () => {
    fc.assert(
      fc.property(
        fc.oneof(fc.constant(""), fc.constant(" "), fc.constant("   ")),
        (name) => {
          const before = listContentFromStore("authors").length;
          const result = createAuthorInStore({ name });
          expect(isMCPError(result)).toBe(true);
          if (isMCPError(result)) {
            expect(result.code).toBe("VALIDATION_ERROR");
            expect(result.message).toContain("name");
          }
          const after = listContentFromStore("authors").length;
          expect(after).toBe(before);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("create_series with invalid author_id: returns validation error, no record created", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (authorId, title) => {
        const before = listContentFromStore("series").length;
        const result = createSeriesInStore({
          title,
          author_id: authorId,
        });
        expect(isMCPError(result)).toBe(true);
        if (isMCPError(result)) {
          expect(result.code).toBe("VALIDATION_ERROR");
          expect(result.message).toContain("author");
        }
        const after = listContentFromStore("series").length;
        expect(after).toBe(before);
      }),
      { numRuns: 100 }
    );
  });

  it("create_chapter with invalid chapter_number (0 or negative): returns validation error, no record created", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.integer({ max: 0 }),
        (novelId, chapter_number) => {
          const novel: Novel = {
            id: novelId,
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

          const before = listContentFromStore("chapters").length;
          const result = createChapterInStore({
            novel_id: novelId,
            chapter_number,
            title: "Chapter",
            content: "Content",
          });
          expect(isMCPError(result)).toBe(true);
          if (isMCPError(result)) {
            expect(result.code).toBe("VALIDATION_ERROR");
            expect(result.message).toContain("chapter_number");
          }
          const after = listContentFromStore("chapters").length;
          expect(after).toBe(before);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("create_character with invalid novel_id: returns validation error, no record created", () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.string({ minLength: 1, maxLength: 200 }).filter((s) => s.trim().length > 0),
        (novelId, name) => {
        const before = listContentFromStore("characters").length;
        const result = createCharacterInStore({
          novel_id: novelId,
          name,
        });
        expect(isMCPError(result)).toBe(true);
        if (isMCPError(result)) {
          expect(result.code).toBe("VALIDATION_ERROR");
          expect(result.message).toContain("novel");
        }
        const after = listContentFromStore("characters").length;
        expect(after).toBe(before);
      }),
      { numRuns: 100 }
    );
  });

  it("update_content with non-existent id: returns NOT_FOUND", () => {
    fc.assert(
      fc.property(fc.uuid(), (id) => {
        const result = updateContentInStore("authors", id, { name: "New Name" });
        expect("code" in result).toBe(true);
        if ("code" in result) {
          expect(result.code).toBe("NOT_FOUND");
        }
      }),
      { numRuns: 100 }
    );
  });
});
