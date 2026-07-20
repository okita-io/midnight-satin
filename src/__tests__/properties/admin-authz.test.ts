/**
 * Admin authorization: Neon `readers.role === 'admin'` (not Clerk Organizations).
 * Non-admin signed-in users must not mutate via admin actions.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import type { SessionPayload } from "@/lib/auth/session-types";

const readerSession: SessionPayload = {
  readerId: "reader-1",
  email: "reader@example.com",
  role: "reader",
  iat: 1,
  exp: 2,
};

const adminSession: SessionPayload = {
  readerId: "admin-1",
  email: "admin@example.com",
  role: "admin",
  iat: 1,
  exp: 2,
};

describe("Admin authorization (checkAdminSession)", () => {
  it("rejects null session", async () => {
    const { checkAdminSession, isAdminSession } = await import("@/lib/auth/admin");
    expect(isAdminSession(null)).toBe(false);
    expect(checkAdminSession(null)).toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("rejects signed-in non-admin readers", async () => {
    const { checkAdminSession, isAdminSession } = await import("@/lib/auth/admin");
    expect(isAdminSession(readerSession)).toBe(false);
    expect(checkAdminSession(readerSession)).toEqual({
      success: false,
      error: "Forbidden",
    });
  });

  it("allows admin role sessions", async () => {
    const { checkAdminSession, isAdminSession } = await import("@/lib/auth/admin");
    expect(isAdminSession(adminSession)).toBe(true);
    expect(checkAdminSession(adminSession)).toBeNull();
  });
});

describe("Admin actions reject non-admin callers", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("createAuthorAction returns Forbidden for reader role", async () => {
    vi.doMock("@/lib/auth/session", () => ({
      getSession: vi.fn(async () => readerSession),
    }));
    vi.doMock("@/lib/admin/admin-data", () => ({
      createAuthor: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      createSeries: vi.fn(),
      createNovel: vi.fn(),
      createChapter: vi.fn(),
      createCharacter: vi.fn(),
      updateContent: vi.fn(),
      adjustUserCredits: vi.fn(),
      hideComment: vi.fn(),
      restoreComment: vi.fn(),
    }));

    const { createAuthorAction } = await import("@/app/actions/admin");
    const result = await createAuthorAction({
      name: "Nope",
    });
    expect(result).toEqual({ success: false, error: "Forbidden" });
  });

  it("adjustCreditsAction returns Forbidden for reader role", async () => {
    vi.doMock("@/lib/auth/session", () => ({
      getSession: vi.fn(async () => readerSession),
    }));
    vi.doMock("@/lib/admin/admin-data", () => ({
      createAuthor: vi.fn(),
      createSeries: vi.fn(),
      createNovel: vi.fn(),
      createChapter: vi.fn(),
      createCharacter: vi.fn(),
      updateContent: vi.fn(),
      adjustUserCredits: vi.fn(async () => {
        throw new Error("should not be called");
      }),
      hideComment: vi.fn(),
      restoreComment: vi.fn(),
    }));

    const { adjustCreditsAction } = await import("@/app/actions/admin");
    const result = await adjustCreditsAction("reader-2", 50, "bonus");
    expect(result).toEqual({ success: false, error: "Forbidden" });
  });
});
