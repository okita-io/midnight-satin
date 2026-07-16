/**
 * Property 9: Access control enforcement (Clerk proxy)
 * Protected routes: /profile, /vault, /admin — unauthenticated users are redirected by clerkMiddleware.
 *
 * Property 10: Session lifecycle — Clerk-backed getSession (mocked here).
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@clerk/nextjs/server", () => {
  return {
    clerkMiddleware: (
      handler: (
        auth: (() => Promise<unknown>) & { protect: () => Promise<void> },
        req: NextRequest
      ) => Promise<unknown>
    ) => {
      return async (req: NextRequest) => {
        const auth = Object.assign(
          async () => ({
            userId: null as string | null,
            isAuthenticated: false,
          }),
          {
            protect: async () => {
              const err = new Error("NEXT_REDIRECT");
              (err as Error & { digest?: string }).digest =
                "NEXT_REDIRECT;replace;/sign-in;307;";
              throw err;
            },
          }
        );
        try {
          await handler(auth, req);
          return new Response(null, { status: 200 });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "";
          if (msg === "NEXT_REDIRECT" || msg.includes("NEXT_REDIRECT")) {
            return Response.redirect(new URL("/sign-in", req.url), 307);
          }
          throw e;
        }
      };
    },
    createRouteMatcher: (patterns: string[]) => {
      return (req: NextRequest) => {
        const path = req.nextUrl.pathname;
        return patterns.some((p) => {
          const base = p.replace("(.*)", "");
          return path === base.replace(/\/$/, "") || path.startsWith(base);
        });
      };
    },
  };
});

describe("Property 9: Access control enforcement", () => {
  it("unauthenticated request to public path is allowed", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/");
    const res = await proxy(req, {} as never);
    expect(res?.status ?? 200).toBe(200);
  });

  it("unauthenticated request to /novel/[id] is allowed", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/novel/some-id");
    const res = await proxy(req, {} as never);
    expect(res?.status ?? 200).toBe(200);
  });

  it("unauthenticated request to /profile redirects to sign-in", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/profile");
    const res = await proxy(req, {} as never);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location") ?? "").toContain("/sign-in");
  });

  it("unauthenticated request to /vault redirects to sign-in", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/vault");
    const res = await proxy(req, {} as never);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location") ?? "").toContain("/sign-in");
  });

  it("unauthenticated request to /admin redirects to sign-in", async () => {
    const { default: proxy } = await import("@/proxy");
    const req = new NextRequest("http://localhost/admin");
    const res = await proxy(req, {} as never);
    expect(res?.status).toBe(307);
    expect(res?.headers.get("location") ?? "").toContain("/sign-in");
  });

  it("unauthenticated webhook routes are not session-protected", async () => {
    const { default: proxy } = await import("@/proxy");
    for (const path of [
      "/api/webhooks/clerk",
      "/api/webhooks/stripe",
      "/api/webhooks/payment",
    ]) {
      const req = new NextRequest(`http://localhost${path}`, { method: "POST" });
      const res = await proxy(req, {} as never);
      expect(res?.status ?? 200).toBe(200);
    }
  });
});

describe("Property 10: Session lifecycle (Clerk bridge)", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("getSession returns null when Clerk is signed out", async () => {
    vi.doMock("@/lib/auth/clerk-reader", () => ({
      ensureReaderForClerkUser: vi.fn(async () => null),
    }));
    const { getSession } = await import("@/lib/auth/session");
    expect(await getSession()).toBeNull();
  });

  it("getSession returns reader session when Clerk user is linked", async () => {
    vi.doMock("@/lib/auth/clerk-reader", () => ({
      ensureReaderForClerkUser: vi.fn(async () => ({
        reader: {
          id: "reader-1",
          email: "a@b.com",
          displayName: "A",
          creditBalance: 200,
          role: "reader" as const,
          createdAt: new Date(),
          lastLoginAt: null,
        },
        session: {
          readerId: "reader-1",
          email: "a@b.com",
          role: "reader",
          iat: 1,
          exp: 2,
        },
      })),
    }));
    const { getSession } = await import("@/lib/auth/session");
    const session = await getSession();
    expect(session?.readerId).toBe("reader-1");
    expect(session?.email).toBe("a@b.com");
  });
});
