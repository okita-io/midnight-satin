/**
 * fast-check generators for Midnight Satin entity types
 * Used in Property 1: Entity storage round-trip
 */

import * as fc from "fast-check";
import type {
  AuthorProfile,
  Series,
  Novel,
  Chapter,
  Character,
  ReaderRow,
  ReadingProgress,
  CreditTransaction,
  ChapterUnlock,
  AuthorFollow,
  CharacterStats,
} from "@/lib/db/types";

const transactionTypes = [
  "purchase",
  "chapter_unlock",
  "endorsement",
  "welcome_bonus",
  "admin_adjustment",
] as const;

/** Dates that serialize/deserialize round-trip (exclude Invalid Date) */
const validDateArb = fc.date().filter((d) => !Number.isNaN(d.getTime()));

export const authorProfileArb: fc.Arbitrary<AuthorProfile> = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 200 }),
  avatarUrl: fc.option(fc.webUrl(), { nil: undefined }),
  biography: fc.option(fc.string(), { nil: undefined }),
  styleTags: fc.array(fc.string({ maxLength: 50 }), { maxLength: 20 }),
  followerCount: fc.nat(100000),
  createdAt: validDateArb,
});

export const seriesArb: fc.Arbitrary<Series> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 300 }),
  authorId: fc.uuid(),
  description: fc.option(fc.string(), { nil: undefined }),
  genreTags: fc.array(fc.string({ maxLength: 50 }), { maxLength: 15 }),
  isComplete: fc.boolean(),
  createdAt: validDateArb,
});

export const novelArb: fc.Arbitrary<Novel> = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 300 }),
  seriesId: fc.option(fc.uuid(), { nil: undefined }),
  authorId: fc.uuid(),
  coverImageUrl: fc.option(fc.webUrl(), { nil: undefined }),
  synopsis: fc.option(fc.string(), { nil: undefined }),
  genreTags: fc.array(fc.string({ maxLength: 50 }), { maxLength: 15 }),
  rating: fc.double({ min: 0, max: 5, noNaN: true }),
  ratingCount: fc.nat(1000000),
  publicationDate: fc.option(validDateArb, { nil: undefined }),
  createdAt: validDateArb,
});

export const chapterArb: fc.Arbitrary<Chapter> = fc.record({
  id: fc.uuid(),
  novelId: fc.uuid(),
  chapterNumber: fc.nat(500),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  content: fc.string({ minLength: 1, maxLength: 50000 }),
  isFree: fc.boolean(),
  createdAt: validDateArb,
  updatedAt: validDateArb,
});

export const characterStatsArb: fc.Arbitrary<CharacterStats> = fc.record({
  consciousWant: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  unconsciousNeed: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  wound: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  fear: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  lieTheyBelieve: fc.option(fc.string({ maxLength: 200 }), { nil: undefined }),
  role: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  age: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  status: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  height: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  occupation: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  zodiacSign: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  bloodType: fc.option(fc.string({ maxLength: 20 }), { nil: undefined }),
  birthday: fc.option(fc.string({ maxLength: 50 }), { nil: undefined }),
  favorites: fc.option(fc.array(fc.string({ maxLength: 100 })), { nil: undefined }),
  dislikes: fc.option(fc.array(fc.string({ maxLength: 100 })), { nil: undefined }),
});

export const characterArb: fc.Arbitrary<Character> = fc.record({
  id: fc.uuid(),
  novelId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 200 }),
  roleSubtitle: fc.option(fc.string({ maxLength: 100 }), { nil: undefined }),
  portraitUrl: fc.option(fc.webUrl(), { nil: undefined }),
  description: fc.option(fc.string(), { nil: undefined }),
  backstory: fc.option(fc.string(), { nil: undefined }),
  stats: characterStatsArb,
  secrets: fc.array(fc.string({ maxLength: 500 }), { maxLength: 10 }),
  endorsementCount: fc.nat(10000),
  hasTrophy: fc.boolean(),
  createdAt: validDateArb,
});

export const readerRowArb: fc.Arbitrary<ReaderRow> = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  displayName: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  creditBalance: fc.nat(100000),
  role: fc.constantFrom("reader", "admin"),
  createdAt: validDateArb,
  lastLoginAt: fc.option(validDateArb, { nil: undefined }),
  passwordHash: fc.string({ minLength: 32, maxLength: 128 }),
});

export const readingProgressArb: fc.Arbitrary<ReadingProgress> = fc.record({
  readerId: fc.uuid(),
  chapterId: fc.uuid(),
  scrollPercent: fc.double({ min: 0, max: 100, noNaN: true }),
  lastReadAt: validDateArb,
});

export const creditTransactionArb: fc.Arbitrary<CreditTransaction> = fc.record({
  id: fc.uuid(),
  readerId: fc.uuid(),
  amount: fc.integer({ min: -1000, max: 10000 }),
  transactionType: fc.constantFrom(...transactionTypes),
  relatedEntityId: fc.option(fc.uuid(), { nil: undefined }),
  createdAt: validDateArb,
});

export const chapterUnlockArb: fc.Arbitrary<ChapterUnlock> = fc.record({
  readerId: fc.uuid(),
  chapterId: fc.uuid(),
  unlockedAt: validDateArb,
});

export const authorFollowArb: fc.Arbitrary<AuthorFollow> = fc.record({
  readerId: fc.uuid(),
  authorId: fc.uuid(),
  followedAt: validDateArb,
});
