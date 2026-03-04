"use client";

import Link from "next/link";

const returnUrl = "/profile";
const loginHref = `/auth/login?returnUrl=${encodeURIComponent(returnUrl)}`;
const registerHref = `/auth/register?returnUrl=${encodeURIComponent(returnUrl)}`;

/**
 * Sign in / Register buttons for guest profile page. Req 18.9.
 */
export function ProfileAuthPrompt() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <Link href={loginHref} className="btn-gold flex-1 text-center">
        Sign in
      </Link>
      <Link
        href={registerHref}
        className="flex-1 text-center rounded border border-[var(--primary)] py-2.5 font-ui text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--void)] transition-colors"
      >
        Register
      </Link>
    </div>
  );
}
