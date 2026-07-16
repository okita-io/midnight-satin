"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

interface AccountActionsListProps {
  /** If true, show full actions; if false, only logout. */
  showAll?: boolean;
}

/**
 * AccountActionsList: Edit Display Name, Manage Email (stub), View Transactions, Logout.
 * Req out via Clerk.
 */
export function AccountActionsList({ showAll = true }: AccountActionsListProps) {
  const regularActions = showAll
    ? [
        { label: "Edit Display Name", icon: "badge" as const, href: "/profile/edit", disabled: true },
        { label: "Manage Email", icon: "email" as const, href: "/profile/email", disabled: true },
        { label: "View Transactions", icon: "receipt_long" as const, href: "/profile/transactions", disabled: true },
      ]
    : [];

  return (
    <section className="px-4 xs:px-6 pb-24">
      <h2 className="font-header text-sm tracking-[0.15em] text-primary uppercase mb-4">
        Account
      </h2>
      <div className="bg-surface border border-white/5 rounded-sm overflow-hidden">
        {regularActions.map((action) =>
          action.disabled ? (
            <div
              key={action.label}
              className="flex items-center gap-3 px-4 py-3 font-ui text-sm text-text-muted cursor-not-allowed opacity-60"
            >
              <span className="material-symbols-outlined text-xl" aria-hidden>
                {action.icon}
              </span>
              {action.label}
              <span className="text-[10px] ml-auto">Coming soon</span>
            </div>
          ) : (
            <Link
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 px-4 py-3 font-ui text-sm text-text-main hover:bg-white/5 transition-colors border-t border-white/5 first:border-t-0"
            >
              <span className="material-symbols-outlined text-text-muted text-xl" aria-hidden>
                {action.icon}
              </span>
              {action.label}
            </Link>
          )
        )}
        <SignOutButton redirectUrl="/">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-4 py-3 text-left font-ui text-sm text-text-main hover:bg-white/5 transition-colors border-t border-white/5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-text-muted text-xl" aria-hidden>
              logout
            </span>
            Log out
          </button>
        </SignOutButton>
      </div>
    </section>
  );
}
