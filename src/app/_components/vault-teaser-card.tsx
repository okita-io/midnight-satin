import Link from "next/link";

/**
 * Vault teaser card: gold gradient promo linking to Vault.
 * Matches reference/midnight_satin_home.html.
 */
export function VaultTeaserCard() {
  return (
    <Link
      href="/vault"
      className="relative w-full bg-gradient-to-r from-[#1a1500] to-surface border border-primary/20 rounded-sm p-5 flex items-center justify-between overflow-hidden block"
      aria-label="Visit the Vault to purchase credits"
    >
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      {/* Sparkle effects */}
      <span className="absolute top-2 right-10 w-1 h-1 bg-primary rounded-full animate-pulse" aria-hidden />
      <span
        className="absolute bottom-4 right-20 w-1 h-1 bg-white rounded-full animate-pulse"
        style={{ animationDelay: "0.5s" }}
        aria-hidden
      />
      <div className="relative z-10">
        <h4 className="font-display italic text-lg text-primary mb-1">Refill your purse</h4>
        <p className="font-ui text-xs text-text-muted max-w-[180px]">
          Unlock exclusive chapters and endorse your favorite suitors.
        </p>
      </div>
      <div className="relative z-10 bg-primary/10 p-2 rounded-full border border-primary/30 text-primary">
        <span className="material-symbols-outlined" aria-hidden>diamond</span>
      </div>
    </Link>
  );
}
