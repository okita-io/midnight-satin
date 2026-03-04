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
  AuthorFollow,
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

/** List all AuthorFollow entities for an author (Property 17). */
function listAuthorFollowsByAuthor(authorId: string): AuthorFollow[] {
  const entries: AuthorFollow[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "AuthorFollow") {
      const af = deserialize<AuthorFollow>(value.data, "AuthorFollow");
      if (af.authorId === authorId) entries.push(af);
    }
  }
  return entries;
}

/** List all Novel entities (Property 18). */
function listAllNovels(): Novel[] {
  const novels: Novel[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "Novel") {
      novels.push(deserialize<Novel>(value.data, "Novel"));
    }
  }
  return novels;
}

/** List all Series entities (Property 18). */
function listAllSeries(): Series[] {
  const series: Series[] = [];
  for (const [, value] of store.entries()) {
    if (value.kind === "Series") {
      series.push(deserialize<Series>(value.data, "Series"));
    }
  }
  return series;
}

/** Check if reader follows author (Property 17). */
export function hasAuthorFollowFromStore(
  readerId: string,
  authorId: string
): boolean {
  const follow = retrieveEntity<AuthorFollow>(
    "AuthorFollow",
    `${readerId}:${authorId}`
  );
  return follow !== null;
}

/** Get author follower count from store (Property 17). Returns author's followerCount. */
export function getAuthorFollowerCountFromStore(authorId: string): number {
  const author = retrieveEntity<AuthorProfile>("AuthorProfile", authorId);
  return author?.followerCount ?? 0;
}

export type FollowAuthorInStoreResult =
  | { success: true; followed: boolean; newFollowerCount: number }
  | { success: false; error: string };

/**
 * Follow an author in the store (Property 17).
 * Mirrors followAuthor server action: creates author_follow record and increments
 * author's follower_count. Idempotent when already following.
 */
export function followAuthorInStore(
  readerId: string,
  authorId: string
): FollowAuthorInStoreResult {
  const author = retrieveEntity<AuthorProfile>("AuthorProfile", authorId);
  if (!author) {
    return { success: false, error: "Author not found." };
  }

  const reader = retrieveEntity<ReaderRow>("ReaderRow", readerId);
  if (!reader) {
    return { success: false, error: "Reader not found." };
  }

  const existingFollow = retrieveEntity<AuthorFollow>(
    "AuthorFollow",
    `${readerId}:${authorId}`
  );
  if (existingFollow) {
    return {
      success: true,
      followed: true,
      newFollowerCount: author.followerCount,
    };
  }

  const follow: AuthorFollow = {
    readerId,
    authorId,
    followedAt: new Date(),
  };
  storeEntity(follow);

  const newFollowerCount = author.followerCount + 1;
  const updatedAuthor: AuthorProfile = {
    ...author,
    followerCount: newFollowerCount,
  };
  storeEntity(updatedAuthor);

  return { success: true, followed: true, newFollowerCount };
}

/** Bibliography novel with series info (Property 18). */
export interface BibliographyNovelFromStore extends Novel {
  seriesTitle: string | null;
  seriesIsComplete: boolean;
}

/** Bibliography group (Property 18). */
export interface BibliographyGroupFromStore {
  seriesId: string | null;
  seriesTitle: string;
  isComplete: boolean;
  novels: BibliographyNovelFromStore[];
}

/**
 * Get author bibliography grouped by series from store (Property 18).
 * Mirrors getAuthorBibliography: novels grouped by series, standalone in separate group.
 */
export function getAuthorBibliographyFromStore(
  authorId: string
): { groups: BibliographyGroupFromStore[]; worksCount: number; avgRating: number } {
  const novels = listAllNovels().filter((n) => n.authorId === authorId);
  const seriesList = listAllSeries();

  const novelsWithSeries: BibliographyNovelFromStore[] = novels.map((n) => {
    const series = n.seriesId
      ? seriesList.find((s) => s.id === n.seriesId)
      : null;
    return {
      ...n,
      seriesTitle: series?.title ?? null,
      seriesIsComplete: series?.isComplete ?? false,
    };
  });

  novelsWithSeries.sort((a, b) => {
    const seriesTitleA = a.seriesTitle ?? "Standalone Novels";
    const seriesTitleB = b.seriesTitle ?? "Standalone Novels";
    if (seriesTitleA !== seriesTitleB) return seriesTitleA.localeCompare(seriesTitleB);
    const dateA = a.publicationDate ?? a.createdAt;
    const dateB = b.publicationDate ?? b.createdAt;
    return dateA.getTime() - dateB.getTime();
  });

  const groupMap = new Map<string | "standalone", BibliographyGroupFromStore>();

  for (const n of novelsWithSeries) {
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
