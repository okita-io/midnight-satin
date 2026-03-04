"use client";

import { CreditBalance } from "../credit-balance";

interface ProfileHeaderProps {
  displayName: string | null;
  email: string;
  creditBalance: number;
  /** Optional avatar URL; if absent, show initials. */
  avatarUrl?: string | null;
}

/**
 * Obfuscate email for display: show first 2 chars + *** + domain.
 * e.g. "jo***@example.com"
 */
function obfuscateEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***@***";
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length <= 2) return "***" + domain;
  return local.slice(0, 2) + "***" + domain;
}

/**
 * Get initials from display name or email.
 */
function getInitials(displayName: string | null, email: string): string {
  if (displayName && displayName.trim()) {
    const parts = displayName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0];
  return local.slice(0, 2).toUpperCase();
}

/**
 * ProfileHeader: Reader avatar, display name, obfuscated email, credit balance pill.
 * Req 18.2.
 */
export function ProfileHeader({
  displayName,
  email,
  creditBalance,
  avatarUrl,
}: ProfileHeaderProps) {
  const initials = getInitials(displayName, email);
  const obfuscated = obfuscateEmail(email);

  return (
    <header className="flex items-center gap-3 xs:gap-4 p-4 xs:p-6 pb-4">
      {/* Avatar */}
      <div className="w-14 h-14 xs:w-16 xs:h-16 shrink-0 rounded-full overflow-hidden border-2 border-primary/40 bg-surface-highlight flex items-center justify-center">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span
            className="font-display font-bold italic text-xl text-primary"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {initials}
          </span>
        )}
      </div>

      {/* Name, email, credit */}
      <div className="flex-1 min-w-0">
        <h1
          className="font-display font-bold italic text-xl xs:text-2xl text-text-main truncate"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {displayName || email.split("@")[0]}
        </h1>
        <p className="font-ui text-sm text-text-muted truncate mt-0.5">
          {obfuscated}
        </p>
        <div className="mt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-surface border border-primary/20">
            <span className="material-symbols-outlined text-primary text-sm" aria-hidden>
              monetization_on
            </span>
            <CreditBalance balance={creditBalance} compact className="text-sm" />
            <span className="font-ui text-[10px] text-text-muted uppercase tracking-wider">
              credits
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
