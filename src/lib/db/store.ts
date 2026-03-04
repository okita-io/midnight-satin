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
  Series,
  ChapterUnlock,
  CreditTransaction,
  ReaderRow,
  Character,
  CharacterStats,
  Comment,
  CommentLike,
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
  | "AuthorFollow"
  | "Comment"
  | "CommentLike";

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
  if ("likeCount" in entity && "content" in entity && "chapterId" in entity)
    return "Comment";
  if ("commentId" in entity && "readerId" in entity && !("content" in entity))
    return "CommentLike";
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
    case "Comment":
      return (entity as Comment).id;
    case "CommentLike": {
      const e = entity as CommentLike;
      return `${e.readerId}:${e.commentId}`;
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
    case "Comment":
      dateKeys.push("createdAt", "updatedAt");
      break;
    case "CommentLike":
      dateKeys.push("createdAt");
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

/** List all Chapter entities (for iteration) */
function listAllChapters(): Chapter[] {
  const chapters: Chapter[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "Chapter") {
      chapters.push(deserialize<Chapter>(value.data, "Chapter"));
    }
  }
  return chapters;
}

/** List all ChapterUnlock entities for a reader */
function listChapterUnlocksByReader(readerId: string): { chapterId: string }[] {
  const entries: { chapterId: string }[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "ChapterUnlock") {
      const cu = deserialize<ChapterUnlock>(value.data, "ChapterUnlock");
      if (cu.readerId === readerId) entries.push({ chapterId: cu.chapterId });
    }
  }
  return entries;
}

/**
 * List chapters for a novel, ordered by chapter_number (Property 14, 15).
 */
export function listChaptersByNovelFromStore(novelId: string): Chapter[] {
  const chapters = listAllChapters().filter((c) => c.novelId === novelId);
  chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
  return chapters;
}

/**
 * Get unlocked chapter IDs for a reader and novel (Property 14).
 */
export function getUnlockedChapterIdsFromStore(
  readerId: string,
  novelId: string
): Set<string> {
  const chapterIds = new Set(
    listChaptersByNovelFromStore(novelId).map((c) => c.id)
  );
  const unlocks = listChapterUnlocksByReader(readerId);
  const result = new Set<string>();
  for (const u of unlocks) {
    if (chapterIds.has(u.chapterId)) result.add(u.chapterId);
  }
  return result;
}

/**
 * Get reading progress for a novel (chapter_id -> scroll_percent) (Property 15).
 */
export function getReadingProgressForNovelFromStore(
  readerId: string,
  novelId: string
): Map<string, number> {
  const chapterIds = new Set(
    listChaptersByNovelFromStore(novelId).map((c) => c.id)
  );
  const progressList = listReadingProgressByReader(readerId);
  const result = new Map<string, number>();
  for (const p of progressList) {
    if (chapterIds.has(p.chapterId)) {
      result.set(p.chapterId, Number(p.scrollPercent));
    }
  }
  return result;
}

/**
 * Get scroll percent for a specific chapter (Property 11: Reading progress round-trip).
 * Returns null if no progress exists.
 */
export function getReadingProgressForChapterFromStore(
  readerId: string,
  chapterId: string
): number | null {
  const progressList = listReadingProgressByReader(readerId);
  const found = progressList.find((p) => p.chapterId === chapterId);
  return found ? Number(found.scrollPercent) : null;
}

/**
 * Check if a chapter is unlocked for a reader (Property 16: Veil display logic).
 */
export function isChapterUnlockedFromStore(
  readerId: string,
  chapterId: string
): boolean {
  const unlocks = listChapterUnlocksByReader(readerId);
  return unlocks.some((u) => u.chapterId === chapterId);
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

const UNLOCK_COST = 5;

/** List credit transactions for a reader (Property 2, 3) */
function listCreditTransactionsByReader(
  readerId: string
): CreditTransaction[] {
  const entries: CreditTransaction[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "CreditTransaction") {
      const ct = deserialize<CreditTransaction>(value.data, "CreditTransaction");
      if (ct.readerId === readerId) entries.push(ct);
    }
  }
  return entries;
}

/**
 * Get reader credit balance from store (Property 2, 3).
 */
export function getReaderBalanceFromStore(readerId: string): number | null {
  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  return reader?.creditBalance ?? null;
}

/**
 * Check if reader has unlocked a chapter (Property 2, 3).
 */
export function hasChapterUnlockFromStore(
  readerId: string,
  chapterId: string
): boolean {
  const unlock = retrieveEntity<ChapterUnlock>(
    "ChapterUnlock",
    `${readerId}:${chapterId}`
  );
  return unlock !== null;
}

/**
 * Count credit_transaction records of type 'chapter_unlock' for reader+chapter (Property 2, 3).
 */
export function countChapterUnlockTransactionsFromStore(
  readerId: string,
  chapterId: string
): number {
  const txs = listCreditTransactionsByReader(readerId);
  return txs.filter(
    (t) =>
      t.transactionType === "chapter_unlock" &&
      t.relatedEntityId === chapterId
  ).length;
}

export type UnlockChapterInStoreResult =
  | { success: true; newBalance: number }
  | { success: false; error: string };

/**
 * Unlock a locked chapter for a reader in the store (Property 2, 3).
 * Mirrors unlockChapter server action logic: deducts 5 credits, creates
 * chapter_unlock and credit_transaction. Idempotent when already unlocked.
 */
export function unlockChapterInStore(
  readerId: string,
  chapterId: string
): UnlockChapterInStoreResult {
  // 1. Idempotent: already unlocked -> return success without deducting
  const existingUnlock = retrieveEntity<ChapterUnlock>(
    "ChapterUnlock",
    `${readerId}:${chapterId}`
  );
  if (existingUnlock) {
    const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
    return {
      success: true,
      newBalance: reader?.creditBalance ?? 0,
    };
  }

  // 2. Chapter must exist and be locked
  const chapter = retrieveEntity<Chapter>("Chapter", chapterId);
  if (!chapter) {
    return { success: false, error: "Chapter not found." };
  }
  if (chapter.isFree) {
    return { success: false, error: "Chapter is free." };
  }

  // 3. Reader must exist and have sufficient balance
  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  if (!reader) {
    return { success: false, error: "Reader not found." };
  }
  const balance = reader.creditBalance;
  if (balance < UNLOCK_COST) {
    return { success: false, error: "Insufficient credits." };
  }

  // 4. Deduct, create transaction, create unlock
  const updatedReader: ReaderRow = {
    ...reader,
    creditBalance: balance - UNLOCK_COST,
  };
  storeEntity(updatedReader);

  const tx: CreditTransaction = {
    id: crypto.randomUUID(),
    readerId,
    amount: -UNLOCK_COST,
    transactionType: "chapter_unlock",
    relatedEntityId: chapterId,
    createdAt: new Date(),
  };
  storeEntity(tx);

  const unlock: ChapterUnlock = {
    readerId,
    chapterId,
    unlockedAt: new Date(),
  };
  storeEntity(unlock);

  return { success: true, newBalance: balance - UNLOCK_COST };
}

const ENDORSEMENT_COST = 1;
const TROPHY_THRESHOLD = 1000;

/**
 * Get character from store (Property 4, 5).
 */
export function getCharacterFromStore(characterId: string): Character | null {
  return retrieveEntity<Character>("Character", characterId);
}

/**
 * Count credit_transaction records of type 'endorsement' for reader+character (Property 4).
 */
export function countEndorsementTransactionsFromStore(
  readerId: string,
  characterId: string
): number {
  const txs = listCreditTransactionsByReader(readerId);
  return txs.filter(
    (t) =>
      t.transactionType === "endorsement" &&
      t.relatedEntityId === characterId
  ).length;
}

export type EndorseCharacterInStoreResult =
  | { success: true; newBalance: number; newCount: number }
  | { success: false; error: string };

/**
 * Endorse a character in the store (Property 4, 5).
 * Mirrors endorseCharacter server action: deducts 1 credit, increments
 * endorsement_count, creates credit_transaction, sets has_trophy when count > 1000.
 */
export function endorseCharacterInStore(
  readerId: string,
  characterId: string
): EndorseCharacterInStoreResult {
  const character = retrieveEntity<Character>("Character", characterId);
  if (!character) {
    return { success: false, error: "Character not found." };
  }

  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  if (!reader) {
    return { success: false, error: "Reader not found." };
  }
  const balance = reader.creditBalance;
  if (balance < ENDORSEMENT_COST) {
    return { success: false, error: "Insufficient credits." };
  }

  const newCount = character.endorsementCount + 1;
  const hasTrophy = newCount > TROPHY_THRESHOLD;

  const updatedReader: ReaderRow = {
    ...reader,
    creditBalance: balance - ENDORSEMENT_COST,
  };
  storeEntity(updatedReader);

  const tx: CreditTransaction = {
    id: crypto.randomUUID(),
    readerId,
    amount: -ENDORSEMENT_COST,
    transactionType: "endorsement",
    relatedEntityId: characterId,
    createdAt: new Date(),
  };
  storeEntity(tx);

  const updatedCharacter: Character = {
    ...character,
    endorsementCount: newCount,
    hasTrophy,
  };
  storeEntity(updatedCharacter);

  return {
    success: true,
    newBalance: balance - ENDORSEMENT_COST,
    newCount,
  };
}

/**
 * Count credit_transaction records of type 'purchase' for a reader (Property 6).
 */
export function countPurchaseTransactionsFromStore(readerId: string): number {
  const txs = listCreditTransactionsByReader(readerId);
  return txs.filter((t) => t.transactionType === "purchase").length;
}

/**
 * Get credit_transaction records of type 'purchase' for a reader (Property 6).
 */
export function getPurchaseTransactionsFromStore(
  readerId: string
): CreditTransaction[] {
  const txs = listCreditTransactionsByReader(readerId);
  return txs.filter((t) => t.transactionType === "purchase");
}

export type GrantCreditsForPurchaseInStoreResult =
  | { success: true; newBalance: number }
  | { success: false; error: string };

/**
 * Grant credits for a successful payment in the store (Property 6).
 * Mirrors payment webhook logic: increases reader balance by credits and
 * creates a credit_transaction record of type 'purchase' with positive amount.
 * A failed payment is simulated by not calling this function.
 */
export function grantCreditsForPurchaseInStore(
  readerId: string,
  credits: number
): GrantCreditsForPurchaseInStoreResult {
  if (credits <= 0) {
    return { success: false, error: "Invalid credits amount." };
  }

  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  if (!reader) {
    return { success: false, error: "Reader not found." };
  }

  const newBalance = reader.creditBalance + credits;

  const updatedReader: ReaderRow = {
    ...reader,
    creditBalance: newBalance,
  };
  storeEntity(updatedReader);

  const tx: CreditTransaction = {
    id: crypto.randomUUID(),
    readerId,
    amount: credits,
    transactionType: "purchase",
    relatedEntityId: null,
    createdAt: new Date(),
  };
  storeEntity(tx);

  return { success: true, newBalance };
}

// --- MCP operations (Property 19, 20, 21, 22) ---

export type MCPCreateResult<T = { id: string }> =
  | T
  | { code: "VALIDATION_ERROR"; message: string; details?: Record<string, string> };

/** Create author in store (Property 19). */
export function createAuthorInStore(params: {
  name: string;
  biography?: string;
  avatar_url?: string;
  style_tags?: string[];
}): MCPCreateResult {
  const trimmed = params.name?.trim();
  if (!trimmed) {
    return {
      code: "VALIDATION_ERROR",
      message: "name is required",
      details: { name: "name is required" },
    };
  }
  const id = crypto.randomUUID();
  const author: AuthorProfile = {
    id,
    name: trimmed,
    avatarUrl: params.avatar_url ?? null,
    biography: params.biography ?? null,
    styleTags: Array.isArray(params.style_tags) ? params.style_tags : [],
    followerCount: 0,
    createdAt: new Date(),
  };
  storeEntity(author);
  return { id };
}

/** Create series in store (Property 19). */
export function createSeriesInStore(params: {
  title: string;
  author_id: string;
  description?: string;
  genre_tags?: string[];
}): MCPCreateResult {
  const trimmed = params.title?.trim();
  if (!trimmed) {
    return {
      code: "VALIDATION_ERROR",
      message: "title is required",
      details: { title: "title is required" },
    };
  }
  if (!params.author_id) {
    return {
      code: "VALIDATION_ERROR",
      message: "author_id is required",
      details: { author_id: "author_id is required" },
    };
  }
  const author = retrieveEntity<AuthorProfile>("AuthorProfile", params.author_id);
  if (!author) {
    return {
      code: "VALIDATION_ERROR",
      message: "author_id not found",
      details: { author_id: "Author does not exist" },
    };
  }
  const id = crypto.randomUUID();
  const series: Series = {
    id,
    title: trimmed,
    authorId: params.author_id,
    description: params.description ?? null,
    genreTags: Array.isArray(params.genre_tags) ? params.genre_tags : [],
    isComplete: false,
    createdAt: new Date(),
  };
  storeEntity(series);
  return { id };
}

/** Create novel in store (Property 19). */
export function createNovelInStore(params: {
  title: string;
  series_id?: string;
  author_id: string;
  cover_image_url?: string;
  synopsis?: string;
  genre_tags?: string[];
}): MCPCreateResult {
  const trimmed = params.title?.trim();
  if (!trimmed) {
    return {
      code: "VALIDATION_ERROR",
      message: "title is required",
      details: { title: "title is required" },
    };
  }
  if (!params.author_id) {
    return {
      code: "VALIDATION_ERROR",
      message: "author_id is required",
      details: { author_id: "author_id is required" },
    };
  }
  const author = retrieveEntity<AuthorProfile>("AuthorProfile", params.author_id);
  if (!author) {
    return {
      code: "VALIDATION_ERROR",
      message: "author_id not found",
      details: { author_id: "Author does not exist" },
    };
  }
  if (params.series_id) {
    const series = retrieveEntity<Series>("Series", params.series_id);
    if (!series) {
      return {
        code: "VALIDATION_ERROR",
        message: "series_id not found",
        details: { series_id: "Series does not exist" },
      };
    }
  }
  const id = crypto.randomUUID();
  const novel: Novel = {
    id,
    title: trimmed,
    seriesId: params.series_id ?? null,
    authorId: params.author_id,
    coverImageUrl: params.cover_image_url ?? null,
    synopsis: params.synopsis ?? null,
    genreTags: Array.isArray(params.genre_tags) ? params.genre_tags : [],
    rating: 0,
    ratingCount: 0,
    publicationDate: null,
    createdAt: new Date(),
  };
  storeEntity(novel);
  return { id };
}

/** Create chapter in store (Property 19). */
export function createChapterInStore(params: {
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_free?: boolean;
}): MCPCreateResult {
  if (!params.novel_id) {
    return {
      code: "VALIDATION_ERROR",
      message: "novel_id is required",
      details: { novel_id: "novel_id is required" },
    };
  }
  if (
    typeof params.chapter_number !== "number" ||
    params.chapter_number < 1
  ) {
    return {
      code: "VALIDATION_ERROR",
      message: "chapter_number must be a positive integer",
      details: { chapter_number: "chapter_number must be >= 1" },
    };
  }
  const trimmed = params.title?.trim();
  if (!trimmed) {
    return {
      code: "VALIDATION_ERROR",
      message: "title is required",
      details: { title: "title is required" },
    };
  }
  if (params.content === undefined || params.content === null) {
    return {
      code: "VALIDATION_ERROR",
      message: "content is required",
      details: { content: "content is required" },
    };
  }
  const novel = retrieveEntity<Novel>("Novel", params.novel_id);
  if (!novel) {
    return {
      code: "VALIDATION_ERROR",
      message: "novel_id not found",
      details: { novel_id: "Novel does not exist" },
    };
  }
  const id = crypto.randomUUID();
  const chapter: Chapter = {
    id,
    novelId: params.novel_id,
    chapterNumber: params.chapter_number,
    title: trimmed,
    content: String(params.content),
    isFree: params.is_free ?? false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  storeEntity(chapter);
  return { id };
}

/** Create character in store (Property 19). */
export function createCharacterInStore(params: {
  novel_id: string;
  name: string;
  role?: string;
  portrait_url?: string;
  description?: string;
  backstory?: string;
  stats?: CharacterStats;
  secrets?: string[];
}): MCPCreateResult {
  if (!params.novel_id) {
    return {
      code: "VALIDATION_ERROR",
      message: "novel_id is required",
      details: { novel_id: "novel_id is required" },
    };
  }
  const trimmed = params.name?.trim();
  if (!trimmed) {
    return {
      code: "VALIDATION_ERROR",
      message: "name is required",
      details: { name: "name is required" },
    };
  }
  const novel = retrieveEntity<Novel>("Novel", params.novel_id);
  if (!novel) {
    return {
      code: "VALIDATION_ERROR",
      message: "novel_id not found",
      details: { novel_id: "Novel does not exist" },
    };
  }
  const id = crypto.randomUUID();
  const stats =
    params.stats && typeof params.stats === "object" ? params.stats : {};
  const secrets = Array.isArray(params.secrets) ? params.secrets : [];
  const character: Character = {
    id,
    novelId: params.novel_id,
    name: trimmed,
    roleSubtitle: params.role ?? null,
    portraitUrl: params.portrait_url ?? null,
    description: params.description ?? null,
    backstory: params.backstory ?? null,
    stats,
    secrets,
    endorsementCount: 0,
    hasTrophy: false,
    createdAt: new Date(),
  };
  storeEntity(character);
  return { id };
}

export type ListContentType =
  | "authors"
  | "series"
  | "novels"
  | "chapters"
  | "characters";

export type ContentItemFromStore =
  | (AuthorProfile & { type: "author" })
  | (Series & { type: "series" })
  | (Novel & { type: "novel" })
  | (Chapter & { type: "chapter" })
  | (Character & { type: "character" });

function listAllAuthors(): AuthorProfile[] {
  const entries: AuthorProfile[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "AuthorProfile") {
      entries.push(deserialize<AuthorProfile>(value.data, "AuthorProfile"));
    }
  }
  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function listAllSeries(): Series[] {
  const entries: Series[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "Series") {
      entries.push(deserialize<Series>(value.data, "Series"));
    }
  }
  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function listAllNovels(): Novel[] {
  const entries: Novel[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "Novel") {
      entries.push(deserialize<Novel>(value.data, "Novel"));
    }
  }
  return entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

function listAllCharacters(): Character[] {
  const entries: Character[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "Character") {
      entries.push(deserialize<Character>(value.data, "Character"));
    }
  }
  return entries.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

/** List content with optional filters (Property 20). */
export function listContentFromStore(
  type: ListContentType,
  filterBy?: { author_id?: string; series_id?: string; novel_id?: string }
): ContentItemFromStore[] {
  switch (type) {
    case "authors":
      return listAllAuthors().map((a) => ({ ...a, type: "author" as const }));
    case "series":
      let series = listAllSeries();
      if (filterBy?.author_id) {
        series = series.filter((s) => s.authorId === filterBy.author_id);
      }
      return series.map((s) => ({ ...s, type: "series" as const }));
    case "novels":
      let novels = listAllNovels();
      if (filterBy?.author_id) {
        novels = novels.filter((n) => n.authorId === filterBy.author_id);
      }
      if (filterBy?.series_id) {
        novels = novels.filter((n) => n.seriesId === filterBy.series_id);
      }
      return novels.map((n) => ({ ...n, type: "novel" as const }));
    case "chapters":
      let chapters = listAllChapters();
      if (filterBy?.novel_id) {
        chapters = chapters.filter((c) => c.novelId === filterBy.novel_id);
      }
      chapters.sort((a, b) => {
        if (a.novelId !== b.novelId) return a.novelId.localeCompare(b.novelId);
        return a.chapterNumber - b.chapterNumber;
      });
      return chapters.map((c) => ({ ...c, type: "chapter" as const }));
    case "characters":
      let characters = listAllCharacters();
      if (filterBy?.novel_id) {
        characters = characters.filter((c) => c.novelId === filterBy.novel_id);
      }
      if (filterBy?.author_id) {
        const novelIds = listAllNovels()
          .filter((n) => n.authorId === filterBy.author_id)
          .map((n) => n.id);
        characters = characters.filter((c) => novelIds.includes(c.novelId));
      }
      return characters.map((c) => ({ ...c, type: "character" as const }));
    default:
      return [];
  }
}

export type UpdateContentInStoreResult =
  | { success: true }
  | { code: "VALIDATION_ERROR"; message: string; details?: Record<string, string> }
  | { code: "NOT_FOUND"; message: string };

const ALLOWED_UPDATES: Record<
  ListContentType,
  { allowed: string[] }
> = {
  authors: { allowed: ["name", "avatar_url", "biography", "style_tags"] },
  series: { allowed: ["title", "description", "genre_tags", "is_complete"] },
  novels: {
    allowed: [
      "title",
      "series_id",
      "cover_image_url",
      "synopsis",
      "genre_tags",
      "publication_date",
    ],
  },
  chapters: { allowed: ["title", "content", "is_free"] },
  characters: {
    allowed: [
      "name",
      "role_subtitle",
      "portrait_url",
      "description",
      "backstory",
      "stats",
      "secrets",
    ],
  },
};

/** Update content by id (Property 21). */
export function updateContentInStore(
  type: ListContentType,
  id: string,
  updates: Record<string, unknown>
): UpdateContentInStoreResult {
  const config = ALLOWED_UPDATES[type];
  if (!config) {
    return {
      code: "VALIDATION_ERROR",
      message: `Invalid type: ${type}`,
    };
  }

  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updates)) {
    const dbKey =
      key === "avatarUrl"
        ? "avatar_url"
        : key === "styleTags"
          ? "style_tags"
          : key === "genreTags"
            ? "genre_tags"
            : key === "isComplete"
              ? "is_complete"
              : key === "seriesId"
                ? "series_id"
                : key === "coverImageUrl"
                  ? "cover_image_url"
                  : key === "publicationDate"
                    ? "publication_date"
                    : key === "isFree"
                      ? "is_free"
                      : key === "roleSubtitle"
                        ? "role_subtitle"
                        : key === "portraitUrl"
                          ? "portrait_url"
                          : key;
    if (config.allowed.includes(dbKey) && value !== undefined) {
      if (dbKey === "stats" && value !== null && typeof value === "object") {
        filtered[dbKey] = value;
      } else if (["style_tags", "genre_tags", "secrets"].includes(dbKey)) {
        filtered[dbKey] = Array.isArray(value) ? value : [];
      } else {
        filtered[dbKey] = value;
      }
    }
  }

  if (Object.keys(filtered).length === 0) {
    return {
      code: "VALIDATION_ERROR",
      message: "No valid updates provided",
      details: { updates: "Must include at least one allowed field" },
    };
  }

  switch (type) {
    case "authors": {
      const author = retrieveEntity<AuthorProfile>("AuthorProfile", id);
      if (!author) {
        return { code: "NOT_FOUND", message: `author with id ${id} not found` };
      }
      const updated: AuthorProfile = {
        ...author,
        ...(filtered.name !== undefined && { name: String(filtered.name) }),
        ...(filtered.avatar_url !== undefined && {
          avatarUrl: filtered.avatar_url as string | null,
        }),
        ...(filtered.biography !== undefined && {
          biography: filtered.biography as string | null,
        }),
        ...(filtered.style_tags !== undefined && {
          styleTags: Array.isArray(filtered.style_tags)
            ? filtered.style_tags
            : [],
        }),
      };
      storeEntity(updated);
      return { success: true };
    }
    case "series": {
      const series = retrieveEntity<Series>("Series", id);
      if (!series) {
        return { code: "NOT_FOUND", message: `series with id ${id} not found` };
      }
      const updated: Series = {
        ...series,
        ...(filtered.title !== undefined && { title: String(filtered.title) }),
        ...(filtered.description !== undefined && {
          description: filtered.description as string | null,
        }),
        ...(filtered.genre_tags !== undefined && {
          genreTags: Array.isArray(filtered.genre_tags)
            ? filtered.genre_tags
            : [],
        }),
        ...(filtered.is_complete !== undefined && {
          isComplete: Boolean(filtered.is_complete),
        }),
      };
      storeEntity(updated);
      return { success: true };
    }
    case "novels": {
      const novel = retrieveEntity<Novel>("Novel", id);
      if (!novel) {
        return { code: "NOT_FOUND", message: `novel with id ${id} not found` };
      }
      const updated: Novel = {
        ...novel,
        ...(filtered.title !== undefined && { title: String(filtered.title) }),
        ...(filtered.series_id !== undefined && {
          seriesId: filtered.series_id as string | null,
        }),
        ...(filtered.cover_image_url !== undefined && {
          coverImageUrl: filtered.cover_image_url as string | null,
        }),
        ...(filtered.synopsis !== undefined && {
          synopsis: filtered.synopsis as string | null,
        }),
        ...(filtered.genre_tags !== undefined && {
          genreTags: Array.isArray(filtered.genre_tags)
            ? filtered.genre_tags
            : [],
        }),
        ...(filtered.publication_date !== undefined && {
          publicationDate:
            typeof filtered.publication_date === "string"
              ? new Date(filtered.publication_date)
              : null,
        }),
      };
      storeEntity(updated);
      return { success: true };
    }
    case "chapters": {
      const chapter = retrieveEntity<Chapter>("Chapter", id);
      if (!chapter) {
        return { code: "NOT_FOUND", message: `chapter with id ${id} not found` };
      }
      const updated: Chapter = {
        ...chapter,
        ...(filtered.title !== undefined && { title: String(filtered.title) }),
        ...(filtered.content !== undefined && {
          content: String(filtered.content),
        }),
        ...(filtered.is_free !== undefined && {
          isFree: Boolean(filtered.is_free),
        }),
        updatedAt: new Date(),
      };
      storeEntity(updated);
      return { success: true };
    }
    case "characters": {
      const character = retrieveEntity<Character>("Character", id);
      if (!character) {
        return {
          code: "NOT_FOUND",
          message: `character with id ${id} not found`,
        };
      }
      const updated: Character = {
        ...character,
        ...(filtered.name !== undefined && { name: String(filtered.name) }),
        ...(filtered.role_subtitle !== undefined && {
          roleSubtitle: filtered.role_subtitle as string | null,
        }),
        ...(filtered.portrait_url !== undefined && {
          portraitUrl: filtered.portrait_url as string | null,
        }),
        ...(filtered.description !== undefined && {
          description: filtered.description as string | null,
        }),
        ...(filtered.backstory !== undefined && {
          backstory: filtered.backstory as string | null,
        }),
        ...(filtered.stats !== undefined && {
          stats:
            filtered.stats && typeof filtered.stats === "object"
              ? (filtered.stats as CharacterStats)
              : {},
        }),
        ...(filtered.secrets !== undefined && {
          secrets: Array.isArray(filtered.secrets) ? filtered.secrets : [],
        }),
      };
      storeEntity(updated);
      return { success: true };
    }
    default:
      return { code: "VALIDATION_ERROR", message: `Invalid type: ${type}` };
  }
}

// --- Admin analytics (Property 24) ---

export interface ContentOverviewFromStore {
  authorCount: number;
  seriesCount: number;
  novelCount: number;
  chapterCount: number;
  characterCount: number;
}

function listAllReaders(): ReaderRow[] {
  const entries: ReaderRow[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "ReaderRow") {
      entries.push(deserialize<ReaderRow>(value.data, "ReaderRow"));
    }
  }
  return entries;
}

function listAllCreditTransactions(): CreditTransaction[] {
  const entries: CreditTransaction[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "CreditTransaction") {
      entries.push(deserialize<CreditTransaction>(value.data, "CreditTransaction"));
    }
  }
  return entries;
}

/** Get content overview counts (Property 24). */
export function getContentOverviewFromStore(): ContentOverviewFromStore {
  return {
    authorCount: listAllAuthors().length,
    seriesCount: listAllSeries().length,
    novelCount: listAllNovels().length,
    chapterCount: listAllChapters().length,
    characterCount: listAllCharacters().length,
  };
}

export interface UserAnalyticsFromStore {
  totalReaders: number;
  activeReaders: number;
  totalCreditsPurchased: number;
  totalCreditsSpent: number;
}

const ACTIVE_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/** Get user analytics (Property 24). */
export function getUserAnalyticsFromStore(): UserAnalyticsFromStore {
  const readers = listAllReaders();
  const allProgress: ReadingProgress[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "ReadingProgress") {
      allProgress.push(
        deserialize<ReadingProgress>(value.data, "ReadingProgress")
      );
    }
  }
  const now = Date.now();
  const activeReaderIds = new Set<string>();
  for (const p of allProgress) {
    if (now - p.lastReadAt.getTime() <= ACTIVE_DAYS_MS) {
      activeReaderIds.add(p.readerId);
    }
  }

  const txs = listAllCreditTransactions();
  let totalPurchased = 0;
  let totalSpent = 0;
  for (const t of txs) {
    if (t.transactionType === "purchase" && t.amount > 0) {
      totalPurchased += t.amount;
    }
    if (
      (t.transactionType === "chapter_unlock" &&
        t.amount < 0) ||
      (t.transactionType === "endorsement" && t.amount < 0)
    ) {
      totalSpent += Math.abs(t.amount);
    }
  }

  return {
    totalReaders: readers.length,
    activeReaders: activeReaderIds.size,
    totalCreditsPurchased: totalPurchased,
    totalCreditsSpent: totalSpent,
  };
}

// --- Comment operations (Property 25, 26) ---

const MAX_COMMENT_LENGTH = 800;

function listCommentLikesByComment(commentId: string): CommentLike[] {
  const entries: CommentLike[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "CommentLike") {
      const cl = deserialize<CommentLike>(value.data, "CommentLike");
      if (cl.commentId === commentId) entries.push(cl);
    }
  }
  return entries;
}

/** Get comment from store (Property 25, 26). */
export function getCommentFromStore(commentId: string): Comment | null {
  return retrieveEntity<Comment>("Comment", commentId);
}

/** Check if reader has liked a comment (Property 26). */
export function hasCommentLikeFromStore(
  readerId: string,
  commentId: string
): boolean {
  const like = retrieveEntity<CommentLike>(
    "CommentLike",
    `${readerId}:${commentId}`
  );
  return like !== null;
}

/** Count comment_likes records for a comment (Property 26). */
export function countCommentLikesFromStore(commentId: string): number {
  return listCommentLikesByComment(commentId).length;
}

export type PostCommentInStoreResult =
  | { success: true; comment: Comment }
  | { success: false; error: string };

/**
 * Post a new comment in the store (Property 25).
 * Associates comment with reader and chapter, sets is_deleted to false.
 */
export function postCommentInStore(
  chapterId: string,
  readerId: string,
  content: string,
  parentCommentId?: string | null
): PostCommentInStoreResult {
  const chapter = retrieveEntity<Chapter>("Chapter", chapterId);
  if (!chapter) {
    return { success: false, error: "Chapter not found." };
  }
  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  if (!reader) {
    return { success: false, error: "Reader not found." };
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Comment content cannot be empty." };
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { success: false, error: "Comment exceeds 800 characters." };
  }

  const comment: Comment = {
    id: crypto.randomUUID(),
    chapterId,
    readerId,
    parentCommentId: parentCommentId ?? null,
    content: trimmed,
    likeCount: 0,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  storeEntity(comment);
  return { success: true, comment };
}

export type EditCommentInStoreResult =
  | { success: true; comment: Comment }
  | { success: false; error: string };

/**
 * Edit a comment in the store (Property 25).
 * Only the comment's author may edit.
 */
export function editCommentInStore(
  commentId: string,
  content: string,
  readerId: string
): EditCommentInStoreResult {
  const comment = retrieveEntity<Comment>("Comment", commentId);
  if (!comment) {
    return { success: false, error: "Comment not found." };
  }
  if (comment.readerId !== readerId) {
    return { success: false, error: "Only the author may edit this comment." };
  }
  if (comment.isDeleted) {
    return { success: false, error: "Cannot edit a deleted comment." };
  }
  const trimmed = content.trim();
  if (trimmed.length === 0) {
    return { success: false, error: "Comment content cannot be empty." };
  }
  if (trimmed.length > MAX_COMMENT_LENGTH) {
    return { success: false, error: "Comment exceeds 800 characters." };
  }

  const updated: Comment = {
    ...comment,
    content: trimmed,
    updatedAt: new Date(),
  };
  storeEntity(updated);
  return { success: true, comment: updated };
}

export type DeleteCommentInStoreResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Soft-delete a comment in the store (Property 25).
 * Only the comment's author may delete. Sets is_deleted to true.
 * Leaves like counts and comment_likes records intact.
 */
export function deleteCommentInStore(
  commentId: string,
  readerId: string
): DeleteCommentInStoreResult {
  const comment = retrieveEntity<Comment>("Comment", commentId);
  if (!comment) {
    return { success: false, error: "Comment not found." };
  }
  if (comment.readerId !== readerId) {
    return { success: false, error: "Only the author may delete this comment." };
  }

  const updated: Comment = {
    ...comment,
    isDeleted: true,
    updatedAt: new Date(),
  };
  storeEntity(updated);
  return { success: true };
}

export type LikeCommentInStoreResult =
  | { success: true; newLikeCount: number }
  | { success: false; error: string };

/**
 * Like a comment in the store (Property 26).
 * Creates exactly one comment_likes record and increments like_count by 1.
 * Idempotent when already liked.
 */
export function likeCommentInStore(
  commentId: string,
  readerId: string
): LikeCommentInStoreResult {
  const comment = retrieveEntity<Comment>("Comment", commentId);
  if (!comment) {
    return { success: false, error: "Comment not found." };
  }
  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  if (!reader) {
    return { success: false, error: "Reader not found." };
  }

  const existingLike = retrieveEntity<CommentLike>(
    "CommentLike",
    `${readerId}:${commentId}`
  );
  if (existingLike) {
    return { success: true, newLikeCount: comment.likeCount };
  }

  const like: CommentLike = {
    readerId,
    commentId,
    createdAt: new Date(),
  };
  storeEntity(like);

  const updated: Comment = {
    ...comment,
    likeCount: comment.likeCount + 1,
    updatedAt: new Date(),
  };
  storeEntity(updated);

  return { success: true, newLikeCount: updated.likeCount };
}

export type UnlikeCommentInStoreResult =
  | { success: true; newLikeCount: number }
  | { success: false; error: string };

/**
 * Unlike a comment in the store (Property 26).
 * Removes the comment_likes record and decrements like_count by 1 (not below 0).
 */
export function unlikeCommentInStore(
  commentId: string,
  readerId: string
): UnlikeCommentInStoreResult {
  const comment = retrieveEntity<Comment>("Comment", commentId);
  if (!comment) {
    return { success: false, error: "Comment not found." };
  }

  const existingLike = retrieveEntity<CommentLike>(
    "CommentLike",
    `${readerId}:${commentId}`
  );
  if (!existingLike) {
    return { success: true, newLikeCount: comment.likeCount };
  }

  store.delete(`CommentLike:${readerId}:${commentId}`);

  const newCount = Math.max(0, comment.likeCount - 1);
  const updated: Comment = {
    ...comment,
    likeCount: newCount,
    updatedAt: new Date(),
  };
  storeEntity(updated);

  return { success: true, newLikeCount: newCount };
}
