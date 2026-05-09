"use client";

import Link from "next/link";
import { FixedBottomBar } from "./chrome-primitives";

type NavTab = "boudoir" | "library" | "vault" | "updates" | "profile";

const TABS: { id: NavTab; href: string; label: string; icon: string }[] = [
  { id: "boudoir", href: "/", label: "Boudoir", icon: "history_edu" },
  { id: "library", href: "/library", label: "Library", icon: "local_library" },
  { id: "vault", href: "/vault", label: "Vault", icon: "storefront" },
  { id: "updates", href: "/updates", label: "Updates", icon: "newspaper" },
  { id: "profile", href: "/profile", label: "Profile", icon: "person_3" },
];

interface NavigationBarProps {
  activeTab: NavTab;
}

function NavTabLink({
  href,
  label,
  icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 flex-1 text-decoration-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm transition-colors duration-300 ease-in-out cursor-pointer active:scale-95"
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
    >
      <div className="relative flex items-center justify-center">
        <span
          className="material-symbols-outlined transition-colors duration-300 ease-in-out"
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
            className="absolute -bottom-2 size-1 bg-primary rounded-full"
            style={{ boxShadow: "0 0 5px var(--color-primary)" }}
            aria-hidden
          />
        )}
      </div>
      <span
        className={`text-[10px] md:text-xs font-ui md:font-header font-medium tracking-wider md:tracking-[0.2em] transition-colors duration-300 ease-in-out ${
          isActive ? "text-primary" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function NavigationBar({ activeTab }: NavigationBarProps) {
  return (
    <FixedBottomBar
      className="px-6 md:px-24 pt-4"
      aria-label="Main navigation"
    >
      <div className="max-w-md md:max-w-96 mx-auto flex justify-between items-end">
        {TABS.map(({ id, href, label, icon }) => (
          <NavTabLink
            key={id}
            href={href}
            label={label}
            icon={icon}
            isActive={activeTab === id}
          />
        ))}
      </div>
    </FixedBottomBar>
  );
}
