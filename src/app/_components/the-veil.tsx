"use client";

/**
 * The Veil — chapter paywall overlay (Req 4.1-4.6).
 * Progressive blur on content; lock icon, "The Veil is Drawn" heading (Cinzel),
 * unlock button (5 credits), balance display.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton } from "@clerk/nextjs";

export interface TheVeilProps {
  /** Current credit balance */
  creditBalance: number;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Unlock handler - called when user taps Lift Veil */
  onUnlock: () => void;
  /** Whether unlock is in progress */
  isUnlocking?: boolean;
  /** Error message (e.g. insufficient credits) */
  error?: string | null;
}

export function TheVeil({
  creditBalance,
  isAuthenticated,
  onUnlock,
  isUnlocking = false,
  error = null,
}: TheVeilProps) {
  const pathname = usePathname();
  const canUnlock = isAuthenticated && creditBalance >= 5;
  const showVaultPrompt = isAuthenticated && creditBalance < 5;

  const ctaShellClassName =
    "group relative w-full overflow-hidden rounded-sm bg-[#1a170e] border border-primary/30 p-[1px] transition-all [@media(hover:hover)]:hover:border-primary [@media(hover:hover)]:hover:shadow-[0px_4px_20px_rgba(212,175,55,0.15)] active:scale-[0.98]";

  return (
    <div
      className="absolute inset-0 -top-12 bottom-0 z-10 flex flex-col items-center justify-end pb-0"
      style={{
        background:
          "linear-gradient(to bottom, rgba(5,5,5,0) 0%, rgba(5,5,5,0.8) 40%, rgba(5,5,5,1) 100%)",
      }}
    >
      <div className="w-full max-w-sm px-4 xs:px-6 pb-4 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="mb-2 text-primary/80">
          <span
            className="material-symbols-outlined animate-pulse"
            style={{ fontSize: 32 }}
            aria-hidden
          >
            lock
          </span>
        </div>
        <h3
          className="font-heading text-lg tracking-[0.1em] text-white mb-1 uppercase"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          The Veil is Drawn
        </h3>
        <p
          className="font-ui text-text-muted text-sm mb-6 text-center"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          To witness what lies beyond, you must offer a tribute.
        </p>

        {!isAuthenticated ? (
          <SignInButton
            mode="modal"
            forceRedirectUrl={pathname && pathname.startsWith("/") ? pathname : "/"}
          >
            <button type="button" className={ctaShellClassName}>
              <div className="relative bg-[#1a170e] px-4 py-3 flex items-center justify-center">
                <span className="font-display font-semibold italic text-lg text-primary">
                  Sign in to unlock
                </span>
              </div>
            </button>
          </SignInButton>
        ) : (
          <>
            <button
              type="button"
              onClick={canUnlock ? onUnlock : undefined}
              disabled={isUnlocking || !canUnlock}
              className={`${ctaShellClassName} disabled:opacity-60 disabled:cursor-not-allowed disabled:[@media(hover:hover)]:hover:border-primary/30 disabled:[@media(hover:hover)]:hover:shadow-none`.trim()}
              aria-label="Lift Veil — 5 Credits"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <div className="relative bg-[#1a170e] px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center text-primary group-hover:text-white group-hover:bg-primary transition-colors">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 18 }}
                    >
                      visibility
                    </span>
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-display font-semibold italic text-lg text-primary leading-none group-hover:text-white transition-colors">
                      {isUnlocking ? "Unlocking…" : "Lift Veil"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-void/50 px-2 py-1 rounded border border-white/5">
                  <span className="font-heading font-semibold text-sm text-white">
                    5
                  </span>
                  <span
                    className="material-symbols-outlined text-primary"
                    style={{ fontSize: 14 }}
                  >
                    monetization_on
                  </span>
                </div>
              </div>
            </button>

            {error && (
              <p className="mt-3 font-ui text-sm text-red-400/90 text-center">
                {error}
              </p>
            )}

            {showVaultPrompt && !error && (
              <p
                className="mt-4 font-ui text-sm text-text-muted text-center"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <Link href="/vault" className="text-primary hover:underline">
                  Visit the Vault
                </Link>{" "}
                to purchase more Credits.
              </p>
            )}
          </>
        )}

        {isAuthenticated && (
          <p
            className="mt-4 font-ui text-xs text-text-muted opacity-60"
            style={{ fontFamily: "var(--font-ui)" }}
          >
            Balance: {creditBalance} Credits
          </p>
        )}
      </div>
    </div>
  );
}
