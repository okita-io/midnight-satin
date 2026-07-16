"use client";

import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

/**
 * Header auth controls: Sign in / Sign up when signed out, UserButton when signed in.
 */
export function ClerkAuthControls() {
  return (
    <>
      <Show when="signed-out">
        <div className="flex items-center gap-2">
          <SignInButton mode="modal">
            <button
              type="button"
              className="font-ui text-[10px] tracking-wider uppercase text-white/80 hover:text-primary transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer px-1"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="font-ui text-[10px] tracking-wider uppercase text-void bg-primary hover:bg-primary/90 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer px-2 py-1"
            >
              Sign up
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-7 ring-1 ring-primary/40",
            },
          }}
        />
      </Show>
    </>
  );
}
