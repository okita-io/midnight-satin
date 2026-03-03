/**
 * In-memory entity store for property testing
 * Simulates database storage/retrieval for Property 1: Entity storage round-trip
 * When Vercel Postgres is configured, replace with real DB implementation
 */

import type {
  StorableEntity,
  ReadingProgress,
  Chapter,
  Novel,
  AuthorProfile,
} from "./types";

/** Current reading result for Property 12 (matches content.CurrentReading shape) */
export interface CurrentReadingFromStore {
  novelId: string;
  novelTitle: string;
  authorName: string;
  chapterNumber: number;
  chapterTitle: string;
  scrollPercent: number;
  chapterId: string;
}

type EntityKind =
  | "AuthorProfile"
  | "Series"
  | "Novel"
  | "Chapter"
  | "Character"
  | "ReaderRow"
  | "ReadingProgress"
  | "CreditTransaction"
  | "ChapterUnlock"
  | "AuthorFollow";

function getEntityKind(entity: StorableEntity): EntityKind {
  if ("passwordHash" in entity) return "ReaderRow";
  if ("scrollPercent" in entity && "readerId" in entity && "chapterId" in entity)
    return "ReadingProgress";
  if ("transactionType" in entity) return "CreditTransaction";
  if ("unlockedAt" in entity && "readerId" in entity && "chapterId" in entity)
    return "ChapterUnlock";
  if ("followedAt" in entity && "readerId" in entity && "authorId" in entity)
    return "AuthorFollow";
  if ("styleTags" in entity && "followerCount" in entity) return "AuthorProfile";
  if ("genreTags" in entity && "authorId" in entity && "isComplete" in entity)
    return "Series";
  if ("ratingCount" in entity && "synopsis" in entity) return "Novel";
  if ("chapterNumber" in entity && "content" in entity) return "Chapter";
  if ("endorsementCount" in entity && "stats" in entity) return "Character";
  throw new Error("Unknown entity type");
}

function getEntityId(entity: StorableEntity): string {
  const kind = getEntityKind(entity);
  switch (kind) {
    case "AuthorProfile":
    case "Series":
    case "Novel":
    case "Chapter":
    case "Character":
    case "CreditTransaction":
      return (entity as { id: string }).id;
    case "ReaderRow":
      return (entity as { id: string }).id;
    case "ReadingProgress":
    case "ChapterUnlock": {
      const e = entity as { readerId: string; chapterId: string };
      return `${e.readerId}:${e.chapterId}`;
    }
    case "AuthorFollow": {
      const e = entity as { readerId: string; authorId: string };
      return `${e.readerId}:${e.authorId}`;
    }
    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
}

/** Serialize entity for storage (handles Date -> ISO string) */
function serialize(entity: StorableEntity): string {
  return JSON.stringify(entity, (_, v) =>
    v instanceof Date ? v.toISOString() : v
  );
}

/** Deserialize entity from storage (handles ISO string -> Date) */
function deserialize<T extends StorableEntity>(
  json: string,
  kind: EntityKind
): T {
  const parsed = JSON.parse(json);
  const dateKeys: string[] = [];
  switch (kind) {
    case "AuthorProfile":
      dateKeys.push("createdAt");
      break;
    case "Series":
      dateKeys.push("createdAt");
      break;
    case "Novel":
      dateKeys.push("createdAt", "publicationDate");
      break;
    case "Chapter":
      dateKeys.push("createdAt", "updatedAt");
      break;
    case "Character":
      dateKeys.push("createdAt");
      break;
    case "ReaderRow":
      dateKeys.push("createdAt", "lastLoginAt");
      break;
    case "ReadingProgress":
      dateKeys.push("lastReadAt");
      break;
    case "CreditTransaction":
      dateKeys.push("createdAt");
      break;
    case "ChapterUnlock":
      dateKeys.push("unlockedAt");
      break;
    case "AuthorFollow":
      dateKeys.push("followedAt");
      break;
  }
  for (const key of dateKeys) {
    if (parsed[key]) {
      parsed[key] = new Date(parsed[key]);
    }
  }
  return parsed as T;
}

const store = new Map<string, { kind: EntityKind; data: string }>();

export function clearStore(): void {
  store.clear();
}

export function storeEntity(entity: StorableEntity): string {
  const kind = getEntityKind(entity);
  const id = getEntityId(entity);
  const key = `${kind}:${id}`;
  store.set(key, { kind, data: serialize(entity) });
  return id;
}

export function retrieveEntity<T extends StorableEntity>(
  kind: EntityKind,
  id: string
): T | null {
  const key = `${kind}:${id}`;
  const entry = store.get(key);
  if (!entry) return null;
  return deserialize<T>(entry.data, entry.kind);
}

export function retrieveById(
  entity: StorableEntity
): StorableEntity | null {
  const kind = getEntityKind(entity);
  const id = getEntityId(entity);
  return retrieveEntity(kind, id);
}

/** List all ReadingProgress records for a reader (Property 12) */
function listReadingProgressByReader(readerId: string): ReadingProgress[] {
  const entries: ReadingProgress[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "ReadingProgress") {
      const rp = deserialize<ReadingProgress>(value.data, "ReadingProgress");
      if (rp.readerId === readerId) entries.push(rp);
    }
  }
  return entries;
}

/**
 * Get current reading for a reader (Property 12: Current reading identification).
 * Returns the novel associated with the reading progress record that has the most
 * recent last_read_at timestamp, along with chapter number and completion percentage.
 */
export function getCurrentReadingFromStore(
  readerId: string
): CurrentReadingFromStore | null {
  const progressList = listReadingProgressByReader(readerId);
  if (progressList.length === 0) return null;

  const mostRecent = progressList.reduce((a, b) =>
    a.lastReadAt >= b.lastReadAt ? a : b
  );

  const chapter = retrieveEntity<Chapter>("Chapter", mostRecent.chapterId);
  if (!chapter) return null;

  const novel = retrieveEntity<Novel>("Novel", chapter.novelId);
  if (!novel) return null;

  const author = retrieveEntity<AuthorProfile>("AuthorProfile", novel.authorId);

  return {
    novelId: novel.id,
    novelTitle: novel.title,
    authorName: author?.name ?? "Unknown",
    chapterNumber: chapter.chapterNumber,
    chapterTitle: chapter.title,
    scrollPercent: mostRecent.scrollPercent,
    chapterId: mostRecent.chapterId,
  };
}
