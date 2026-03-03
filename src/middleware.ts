import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookieName, verifySessionToken } from "@/lib/auth/session";

const PROTECTED_PREFIXES = ["/profile", "/admin", "/vault"];
const AUTH_PAGES = ["/auth/login", "/auth/register"];

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const cookieName = getSessionCookieName();
  const token = request.cookies.get(cookieName)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isProtected(pathname)) {
    if (!session) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("returnUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  if (isAuthPage(pathname) && session) {
    const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/";
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/vault", "/vault/:path*", "/auth/login", "/auth/register"],
};
