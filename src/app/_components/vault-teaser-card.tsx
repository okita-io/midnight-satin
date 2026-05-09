import Link from "next/link";

/**
 * Vault teaser card: gold gradient promo linking to Vault.
 * Matches reference/midnight_satin_home.html.
 */
export function VaultTeaserCard() {
  return (
    <Link
      href="/vault"
      className="relative w-full bg-gradient-to-b from-[#1a1500] to-surface border border-primary/20 rounded-sm p-5 flex items-center gap-3 overflow-hidden block"
      aria-label="Visit the Vault to purchase credits"
    >
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/20 to-transparent pointer-events-none" />
      <div className="relative z-10 flex-1 min-w-0">
        <h4 className="font-display italic text-lg font-semibold text-primary mb-1">
          Refill your purse
        </h4>
        <p className="font-ui text-[12px] leading-[1.4] text-text-muted max-w-[200px]">
          Unlock exclusive chapters and endorse your favorite suitors.
        </p>
      </div>
      <div className="relative z-10 size-11 bg-primary/10 rounded-full border border-primary/30 text-primary flex items-center justify-center">
        <span className="material-symbols-outlined" style={{ fontSize: 24 }} aria-hidden>
          diamond
        </span>
      </div>
    </Link>
  );
}
