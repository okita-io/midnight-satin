"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: "dashboard" },
  { href: "/admin/authors", label: "Authors", icon: "person" },
  { href: "/admin/series", label: "Series", icon: "menu_book" },
  { href: "/admin/novels", label: "Novels", icon: "auto_stories" },
  { href: "/admin/chapters", label: "Chapters", icon: "article" },
  { href: "/admin/characters", label: "Characters", icon: "groups" },
  { href: "/admin/users", label: "Users", icon: "people" },
  { href: "/admin/comments", label: "Comments", icon: "comment" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-void text-text-main flex flex-col md:flex-row">
      <aside className="w-full md:w-56 md:min-h-screen bg-surface border-r border-primary/20 shrink-0">
        <div className="p-4 pt-safe-top">
          <Link
            href="/admin"
            className="font-header text-primary text-lg tracking-wider block mb-6"
          >
            Midnight Satin Admin
          </Link>
          <nav className="flex flex-wrap gap-2 md:flex-col md:gap-0">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-sm font-ui text-sm transition-colors ${
                    isActive
                      ? "bg-primary/20 text-primary border border-primary/40"
                      : "text-text-muted hover:text-text-main hover:bg-surface-highlight"
                  }`}
                >
                  <span
                    className="material-symbols-outlined text-lg"
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-6 pb-safe-bottom overflow-auto">
        {children}
      </main>
    </div>
  );
}
