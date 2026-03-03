"use client";

/**
 * Credit balance display widget. Matches Vault-style gold gradient for large numbers.
 * Can be used in header, profile, or Vault.
 */
interface CreditBalanceProps {
  balance: number;
  /** Compact: smaller text for nav/header. Default false = large display. */
  compact?: boolean;
  className?: string;
}

export function CreditBalance({ balance, compact = false, className = "" }: CreditBalanceProps) {
  const formatted = balance.toLocaleString();

  if (compact) {
    return (
      <span
        className={`font-display italic font-bold text-primary ${className}`}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {formatted}
      </span>
    );
  }

  return (
    <span
      className={`font-display italic font-bold bg-gradient-to-b from-[#F9E076] to-primary bg-clip-text text-transparent drop-shadow-lg ${className}`}
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "3rem",
        lineHeight: 1,
      }}
    >
      {formatted}
    </span>
  );
}
