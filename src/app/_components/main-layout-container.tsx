"use client";

import { usePathname } from "next/navigation";

/**
 * Wraps main app content and applies sidebar offset on tablet+ when the current
 * page shows the NavigationBar (i.e. not on Reading Room or Cast Gallery).
 * Reading Room path: /novel/[id]/read/[chapterId]
 */
export function MainLayoutContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isReadingRoom = pathname?.includes("/read/") ?? false;
  const withSidebar = !isReadingRoom;

  return (
    <div
      className={`${className} ${withSidebar ? "responsive-with-sidebar" : ""}`}
    >
      {children}
    </div>
  );
}
