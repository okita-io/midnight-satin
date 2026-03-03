"use client";

import Link from "next/link";

export type NavTab = "boudoir" | "library" | "vault" | "profile";

const TABS: { id: NavTab; href: string; label: string; icon: string }[] = [
  { id: "boudoir", href: "/", label: "Boudoir", icon: "history_edu" },
  { id: "library", href: "/library", label: "Library", icon: "local_library" },
  { id: "vault", href: "/vault", label: "Vault", icon: "storefront" },
  { id: "profile", href: "/profile", label: "Profile", icon: "person_3" },
];

interface NavigationBarProps {
  activeTab: NavTab;
}

export function NavigationBar({ activeTab }: NavigationBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#080808] border-t border-[#1F1F1F] px-6 pt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
      style={{
        paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
      }}
      aria-label="Main navigation"
    >
      <div className="flex justify-between items-end">
        {TABS.map(({ id, href, label, icon }) => {
          const isActive = activeTab === id;
          return (
            <Link
              key={id}
              href={href}
              className="flex flex-col items-center gap-1.5 flex-1 text-decoration-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative flex items-center justify-center">
                <span
                  className="material-symbols-outlined transition-colors"
                  style={{
                    fontSize: isActive ? 28 : 24,
                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                    ...(isActive && {
                      filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))",
                    }),
                  }}
                  aria-hidden
                >
                  {icon}
                </span>
                {isActive && (
                  <span
                    className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_#D4AF37]"
                    aria-hidden
                  />
                )}
              </div>
              <span
                className={`text-[10px] font-ui font-medium tracking-wider transition-colors ${
                  isActive ? "text-primary" : "text-text-muted"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
