/**
 * Property 1: Entity storage round-trip
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10
 *
 * For any valid entity (AuthorProfile, Series, Novel, Chapter, Character, Reader,
 * ReadingProgress, CreditTransaction, ChapterUnlock, AuthorFollow), storing it
 * in the database and then retrieving it by ID should produce an object with
 * equivalent field values to the original input.
 */

import { describe, it, expect, beforeEach } from "vitest";
import * as fc from "fast-check";
import {
  storeEntity,
  retrieveById,
  clearStore,
} from "@/lib/db/store";
import type { StorableEntity } from "@/lib/db/types";
import {
  authorProfileArb,
  seriesArb,
  novelArb,
  chapterArb,
  characterArb,
  readerRowArb,
  readingProgressArb,
  creditTransactionArb,
  chapterUnlockArb,
  authorFollowArb,
} from "../generators/entities.gen";

/** Compare two values for equivalence (handles Date, undefined, nested objects) */
function equiv(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  // undefined and missing key are equivalent (JSON drops undefined)
  if (a === undefined || b === undefined) {
    return (a === undefined || a === null) && (b === undefined || b === null);
  }
  if (a instanceof Date && b instanceof Date) {
    const ta = a.getTime();
    const tb = b.getTime();
    return ta === tb || (Number.isNaN(ta) && Number.isNaN(tb));
  }
  if (typeof a === "object" && a !== null && typeof b === "object" && b !== null) {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA).sort();
    const keysB = Object.keys(objB).sort();
    const allKeys = [...new Set([...keysA, ...keysB])];
    for (const k of allKeys) {
      const va = objA[k];
      const vb = objB[k];
      if (!equiv(va ?? undefined, vb ?? undefined)) return false;
    }
    return true;
  }
  if (typeof a === "number" && typeof b === "number") {
    return a === b || (Number.isNaN(a) && Number.isNaN(b));
  }
  return false;
}

function entityEquiv(a: StorableEntity, b: StorableEntity): boolean {
  return equiv(a, b);
}

describe("Property 1: Entity storage round-trip", () => {
  beforeEach(() => clearStore());

  it("AuthorProfile round-trip", () => {
    fc.assert(
      fc.property(authorProfileArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("Series round-trip", () => {
    fc.assert(
      fc.property(seriesArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("Novel round-trip", () => {
    fc.assert(
      fc.property(novelArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("Chapter round-trip", () => {
    fc.assert(
      fc.property(chapterArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("Character round-trip", () => {
    fc.assert(
      fc.property(characterArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("ReaderRow round-trip", () => {
    fc.assert(
      fc.property(readerRowArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("ReadingProgress round-trip", () => {
    fc.assert(
      fc.property(readingProgressArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("CreditTransaction round-trip", () => {
    fc.assert(
      fc.property(creditTransactionArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("ChapterUnlock round-trip", () => {
    fc.assert(
      fc.property(chapterUnlockArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("AuthorFollow round-trip", () => {
    fc.assert(
      fc.property(authorFollowArb, (entity) => {
        storeEntity(entity);
        const retrieved = retrieveById(entity);
        expect(retrieved).not.toBeNull();
        expect(entityEquiv(entity, retrieved!)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });
});
