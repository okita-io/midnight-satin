"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";

/**
 * Sign in / Register buttons for guest profile page. Req 18.9.
 */
export function ProfileAuthPrompt() {
  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <SignInButton mode="modal" forceRedirectUrl="/profile">
        <button type="button" className="btn-gold flex-1 text-center cursor-pointer">
          Sign in
        </button>
      </SignInButton>
      <SignUpButton mode="modal" forceRedirectUrl="/profile">
        <button
          type="button"
          className="flex-1 text-center rounded border border-[var(--primary)] py-2.5 font-ui text-sm font-bold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--void)] transition-colors cursor-pointer"
        >
          Register
        </button>
      </SignUpButton>
    </div>
  );
}
