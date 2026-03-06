"use client";

import Link from "next/link";

export type NavTab = "boudoir" | "library" | "vault" | "profile";

const TABS: { id: NavTab; href: string; label: string; icon: string }[] = [
  { id: "boudoir", href: "/", label: "Boudoir", icon: "history_edu" },
  { id: "library", href: "/library", label: "Library", icon: "local_library" },
  { id: "vault", href: "/vault", label: "Vault", icon: "storefront" },
  { id: "profile", href: "/profile", label: "Profile", icon: "person_3" },
];

export type NavLayout = "bottom" | "side";

interface NavigationBarProps {
  activeTab: NavTab;
  /** Layout mode. When undefined, auto-switches at 768px (bottom on mobile, side on tablet+). */
  layout?: NavLayout;
}

function NavTabLinkBottom({
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
            className="absolute -bottom-2 w-1 h-1 bg-primary rounded-full shadow-[0_0_5px_#D4AF37]"
            aria-hidden
          />
        )}
      </div>
      <span
        className={`text-[10px] font-ui font-medium tracking-wider transition-colors duration-300 ease-in-out ${
          isActive ? "text-primary" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

function NavTabLinkSide({
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
      className="flex items-center gap-3 px-6 py-4 h-14 text-decoration-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm transition-colors duration-300 ease-in-out cursor-pointer active:scale-95"
      aria-label={label}
      aria-current={isActive ? "page" : undefined}
    >
      <span
        className="material-symbols-outlined transition-all duration-300 ease-in-out"
        style={{
          fontSize: 24,
          color: isActive ? "var(--primary)" : "var(--text-muted)",
          ...(isActive && {
            filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))",
          }),
        }}
        aria-hidden
      >
        {icon}
      </span>
      <span
        className={`font-ui font-medium tracking-wider text-sm ${
          isActive ? "text-primary" : "text-text-muted"
        }`}
      >
        {label}
      </span>
    </Link>
  );
}

export function NavigationBar({ activeTab, layout }: NavigationBarProps) {
  const useSideOnly = layout === "side";
  const useBottomOnly = layout === "bottom";

  if (useSideOnly) {
    return (
      <nav
        className="nav-side-panel fixed left-0 top-0 bottom-0 z-50 w-[280px] flex flex-col bg-[#080808] border-r border-[#1F1F1F] transition-all duration-300 ease-in-out"
        aria-label="Main navigation"
      >
        <div
          className="flex items-center gap-2 px-6 h-16 border-b border-[#1F1F1F] shrink-0"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <span
            className="material-symbols-outlined text-primary text-xl"
            aria-hidden
          >
            menu_book
          </span>
          <span className="font-header text-sm tracking-[0.2em] text-primary">
            Midnight Satin
          </span>
        </div>
        <div className="flex flex-col flex-1">
          {TABS.map(({ id, href, label, icon }) => (
            <NavTabLinkSide
              key={id}
              href={href}
              label={label}
              icon={icon}
              isActive={activeTab === id}
            />
          ))}
        </div>
      </nav>
    );
  }

  if (useBottomOnly) {
    return (
      <nav
        className="nav-bottom-bar fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#080808] border-t border-[#1F1F1F] px-6 pt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out"
        style={{
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Main navigation"
      >
        <div className="flex justify-between items-end w-full">
          {TABS.map(({ id, href, label, icon }) => (
            <NavTabLinkBottom
              key={id}
              href={href}
              label={label}
              icon={icon}
              isActive={activeTab === id}
            />
          ))}
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav
        className="nav-bottom-bar flex md:hidden fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto bg-[#080808] border-t border-[#1F1F1F] px-6 pt-4 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-all duration-300 ease-in-out"
        style={{
          paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))",
        }}
        aria-label="Main navigation"
      >
        <div className="flex justify-between items-end w-full">
          {TABS.map(({ id, href, label, icon }) => (
            <NavTabLinkBottom
              key={id}
              href={href}
              label={label}
              icon={icon}
              isActive={activeTab === id}
            />
          ))}
        </div>
      </nav>
      <nav
        className="nav-side-panel hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-[280px] flex-col bg-[#080808] border-r border-[#1F1F1F] transition-all duration-300 ease-in-out"
        aria-label="Main navigation"
      >
        <div
          className="flex items-center gap-2 px-6 h-16 border-b border-[#1F1F1F] shrink-0"
          style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
          <span
            className="material-symbols-outlined text-primary text-xl"
            aria-hidden
          >
            menu_book
          </span>
          <span className="font-header text-sm tracking-[0.2em] text-primary">
            Midnight Satin
          </span>
        </div>
        <div className="flex flex-col flex-1">
          {TABS.map(({ id, href, label, icon }) => (
            <NavTabLinkSide
              key={id}
              href={href}
              label={label}
              icon={icon}
              isActive={activeTab === id}
            />
          ))}
        </div>
      </nav>
    </>
  );
}
