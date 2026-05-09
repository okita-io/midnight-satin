import Link from "next/link";
import { redirect } from "next/navigation";
import { sitePageMetadata } from "@/lib/site-metadata";
import { getCurrentReader } from "@/app/actions/auth";
import { NavigationBar } from "../_components/navigation-bar";
import { VaultClient } from "./vault-client";

/**
 * The Vault (Store) — credit packs and purchases.
 * SSR for real-time credit balance (design doc).
 * Req 8.1-8.3, 8.8, 11.1, 14.1-14.6
 */
export const dynamic = "force-dynamic";

export const metadata = sitePageMetadata(
  "The Vault",
  "Purchase credits to unlock chapters and support authors on Midnight Satin."
);

export default async function VaultPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>;
}) {
  const params = await searchParams;
  if (params.canceled === "1") {
    redirect("/vault");
  }

  const reader = await getCurrentReader();
  const creditBalance = reader?.creditBalance ?? 0;
  const isAuthenticated = !!reader;
  const purchaseSuccess = params.success === "1";

  // Web-only Stripe does not support restore; hide RestoreButton per Req 8.8
  const supportsRestore = false;

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background gradient spot */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* Header */}
      <header
        className="relative z-10 pt-12 pb-4 xs:pb-6 px-4 xs:px-6 text-center"
        style={{ paddingTop: "calc(3rem + env(safe-area-inset-top, 0px))" }}
      >
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/"
            className="text-text-muted hover:text-primary transition-colors p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer active:scale-95"
            aria-label="Back to home"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 24 }}>
              arrow_back
            </span>
          </Link>
          <h1 className="font-header text-sm tracking-[0.15em] text-primary uppercase">
            The Vault
          </h1>
          {supportsRestore ? (
            <button
              type="button"
              className="text-text-muted hover:text-primary transition-colors p-2 text-xs font-ui tracking-wide focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm cursor-pointer active:scale-95"
              aria-label="Restore previous purchases"
            >
              RESTORE
            </button>
          ) : (
            <div className="w-14" />
          )}
        </div>

        {/* CreditBalanceDisplay — Req 8.1. THE-73: 48px tablet, 56px desktop */}
        <div className="mt-6 xs:mt-8 mb-4 flex flex-col items-center justify-center">
          <div className="relative">
            <span
              className="font-display text-5xl xs:text-6xl md:text-[48px] lg:text-[56px] italic font-bold gold-text-gradient drop-shadow-lg"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {creditBalance.toLocaleString()}
            </span>
            <span
              className="absolute -top-2 -right-6 text-primary material-symbols-outlined animate-pulse"
              style={{ fontVariationSettings: "'FILL' 1" }}
              aria-hidden
            >
              spark
            </span>
          </div>
          <p className="font-script text-xl xs:text-2xl text-text-muted mt-2 opacity-80">
            Available Credits
          </p>
          <p className="text-xs font-ui text-text-muted mt-1 uppercase tracking-widest opacity-60">
            Acquire credits to unveil stories
          </p>
        </div>
      </header>

      {/* Main: CreditPackGrid, LegalLinks, RestoreButton */}
      <VaultClient
        isAuthenticated={isAuthenticated}
        purchaseSuccess={purchaseSuccess}
      />

      <NavigationBar activeTab="vault" />
    </div>
  );
}
