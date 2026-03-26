/**
 * Property 2: Word count whitespace splitting
 * Validates: Requirements 4.2, 4.3
 *
 * For any string, countWords(text) shall return the number of non-empty tokens
 * produced by splitting text on whitespace boundaries (/\s+/). Equivalently,
 * countWords(text) equals text.trim().split(/\s+/).filter(Boolean).length,
 * and for the empty string or all-whitespace string, it returns 0.
 *
 * Property 3: Word count additivity across chapters
 * Validates: Requirements 3.4, 4.4
 *
 * For any list of chapter content strings, the sum of countWords applied to each
 * string individually shall equal countWords applied to the concatenation of all
 * strings joined by a single space.
 */

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { countWords } from "@/lib/paperback/word-count";

describe("Property 2: Word count whitespace splitting", () => {
  // Feature: buy-paperback, Property 2: Word count whitespace splitting
  it("countWords matches reference implementation for any string with varied whitespace", () => {
    const whitespaceChunk = fc.constantFrom(" ", "\t", "\n", "\r", "  ", "\t\t", "\n\n", " \t ", "\r\n");
    const word = fc.array(
      fc.integer({ min: 0x21, max: 0x7e }).map((c) => String.fromCharCode(c)),
      { minLength: 1, maxLength: 10 }
    ).map((chars) => chars.join(""));

    // Generate strings that mix words and whitespace in varied patterns
    const arbitraryText = fc.oneof(
      // Completely empty
      fc.constant(""),
      // Only whitespace
      fc.array(whitespaceChunk, { minLength: 1, maxLength: 5 }).map((ws) => ws.join("")),
      // Words separated by varied whitespace
      fc.tuple(
        fc.array(word, { minLength: 1, maxLength: 10 }),
        fc.array(whitespaceChunk, { minLength: 1, maxLength: 10 })
      ).map(([words, spaces]) => {
        let result = "";
        for (let i = 0; i < words.length; i++) {
          if (i > 0) result += spaces[i % spaces.length];
          result += words[i];
        }
        return result;
      }),
      // Random unicode strings (general case)
      fc.string({ minLength: 0, maxLength: 200 })
    );

    fc.assert(
      fc.property(arbitraryText, (text: string) => {
        const result = countWords(text);

        // Reference implementation
        const trimmed = text.trim();
        const expected = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).filter(Boolean).length;

        expect(result).toBe(expected);
      }),
      { numRuns: 100 }
    );
  });
});

describe("Property 3: Word count additivity across chapters", () => {
  // Feature: buy-paperback, Property 3: Word count additivity across chapters
  it("sum of individual countWords equals countWords of joined string", () => {
    const chapterContent = fc.array(
      fc.string({ minLength: 0, maxLength: 100 }),
      { minLength: 0, maxLength: 10 }
    );

    fc.assert(
      fc.property(chapterContent, (chapters: string[]) => {
        const sumIndividual = chapters.reduce((sum, ch) => sum + countWords(ch), 0);
        const joined = chapters.join(" ");
        const countJoined = countWords(joined);

        expect(sumIndividual).toBe(countJoined);
      }),
      { numRuns: 100 }
    );
  });
});
