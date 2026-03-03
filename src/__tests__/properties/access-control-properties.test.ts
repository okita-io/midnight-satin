/**
 * Property 9: Access control enforcement
 * Validates: Requirements 9.1, 9.2, 12.9, 13.1, 17.6
 *
 * For any unauthenticated request, access to public routes (Boudoir, Novel Detail, free chapter)
 * should be granted. For any unauthenticated request to protected actions/routes (profile, vault, admin),
 * the system should reject with redirect to login. For authenticated request with valid session,
 * protected routes should be allowed.
 *
 * Property 10: Session lifecycle
 * Validates: Requirements 9.5, 9.6
 *
 * For any authenticated reader, the session should contain the correct reader ID; after
 * logoutReader, the session should be cleared and getSession should return null.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { SignJWT } from "jose";
import { middleware } from "@/middleware";
import {
  createSession,
  getSession,
  deleteSession,
  getSessionCookieName,
  verifySessionToken,
} from "@/lib/auth/session";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "midnight-satin-dev-secret-change-in-production"
);
const JWT_ISSUER = "midnight-satin";
const JWT_AUDIENCE = "midnight-satin-reader";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

const { getCookieStore } = vi.hoisted(() => {
  const store: Record<string, string> = {};
  return {
    getCookieStore: () => ({
      get: (name: string) => ({ value: store[name] }),
      set: (name: string, value: string) => {
        store[name] = value;
      },
      delete: (name: string) => {
        delete store[name];
      },
    }),
  };
});

vi.mock("next/headers", () => ({ cookies: () => Promise.resolve(getCookieStore()) }));

async function createValidToken(readerId: string, email: string, role: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  return new SignJWT({ readerId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(JWT_SECRET);
}

describe("Property 9: Access control enforcement", () => {
  it("unauthenticated request to public path is allowed", async () => {
    const req = new NextRequest("http://localhost/");
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("unauthenticated request to /novel/[id] is allowed", async () => {
    const req = new NextRequest("http://localhost/novel/some-id");
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("unauthenticated request to /profile redirects to login", async () => {
    const req = new NextRequest("http://localhost/profile");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    const location = res.headers.get("location") ?? "";
    expect(location).toContain("/auth/login");
    expect(location).toContain("returnUrl=");
  });

  it("unauthenticated request to /vault redirects to login", async () => {
    const req = new NextRequest("http://localhost/vault");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("unauthenticated request to /admin redirects to login", async () => {
    const req = new NextRequest("http://localhost/admin");
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });

  it("authenticated request to protected route is allowed", async () => {
    const token = await createValidToken("reader-uuid", "u@example.com", "reader");
    const cookieName = getSessionCookieName();
    const req = new NextRequest("http://localhost/profile", {
      headers: { Cookie: `${cookieName}=${token}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("invalid token on protected route redirects to login", async () => {
    const cookieName = getSessionCookieName();
    const req = new NextRequest("http://localhost/profile", {
      headers: { Cookie: `${cookieName}=invalid.jwt.token` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toContain("/auth/login");
  });
});

describe("Property 10: Session lifecycle", () => {
  beforeEach(async () => {
    await deleteSession();
  });

  it("createSession then getSession returns correct readerId", async () => {
    const readerId = "session-test-reader-id";
    const email = "session@test.example.com";
    const role = "reader";

    await createSession(readerId, email, role);
    const session = await getSession();

    expect(session).not.toBeNull();
    expect(session!.readerId).toBe(readerId);
    expect(session!.email).toBe(email);
    expect(session!.role).toBe(role);
  });

  it("after deleteSession, getSession returns null", async () => {
    await createSession("id", "e@x.com", "reader");
    expect(await getSession()).not.toBeNull();

    await deleteSession();
    const after = await getSession();
    expect(after).toBeNull();
  });

  it("verifySessionToken validates token produced by createSession", async () => {
    const readerId = "verify-test-id";
    const email = "verify@test.example.com";
    const role = "reader";

    const token = await createSession(readerId, email, role);
    const payload = await verifySessionToken(token);

    expect(payload).not.toBeNull();
    expect(payload!.readerId).toBe(readerId);
    expect(payload!.email).toBe(email);
  });
});
