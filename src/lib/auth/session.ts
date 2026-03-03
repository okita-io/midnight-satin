import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "midnight-satin-session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "midnight-satin-dev-secret-change-in-production"
);
const JWT_ISSUER = "midnight-satin";
const JWT_AUDIENCE = "midnight-satin-reader";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  readerId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/** Create a JWT for the given reader and set HTTP-only cookie. */
export async function createSession(readerId: string, email: string, role: string): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const token = await new SignJWT({ readerId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(JWT_SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SEC,
    path: "/",
  });

  return token;
}

/** Read and verify session from cookie. Returns null if missing or invalid. */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    const readerId = payload.readerId as string;
    const email = payload.email as string;
    const role = (payload.role as string) ?? "reader";
    const exp = payload.exp as number;
    const iat = payload.iat as number;
    if (!readerId || !email) return null;
    return { readerId, email, role, exp, iat };
  } catch {
    return null;
  }
}

/** Remove session cookie (logout). */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Cookie name for middleware (Edge can't use next/headers cookies() the same way). */
export function getSessionCookieName(): string {
  return COOKIE_NAME;
}

/** Verify a raw token string (for Edge middleware). Returns payload or null. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    const readerId = payload.readerId as string;
    const email = payload.email as string;
    const role = (payload.role as string) ?? "reader";
    const exp = payload.exp as number;
    const iat = payload.iat as number;
    if (!readerId || !email) return null;
    return { readerId, email, role, exp, iat };
  } catch {
    return null;
  }
}
