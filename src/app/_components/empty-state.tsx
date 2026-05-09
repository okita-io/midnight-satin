"use client";

import Link from "next/link";

interface EmptyStateProps {
  message: string;
  subtitle?: string;
  showBrowse?: boolean;
  className?: string;
}

export function EmptyState({
  message,
  subtitle = "Discover stories of midnight passion and satin whispers.",
  showBrowse = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center gap-5 relative ${className}`}>
      <div className="relative w-full h-[132px]">
        <div className="absolute left-1/2 -translate-x-1/2 -top-9 w-[220px] h-[220px] bg-primary/[0.08] rounded-full blur-[40px] -z-10" />
        <div className="absolute left-1/2 -translate-x-1/2 top-[18px] w-24 h-24 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-primary/40 text-4xl"
          aria-hidden
        >
          auto_stories
        </span>
        </div>
      </div>
      <p className="font-script text-3xl text-primary text-center opacity-90">
        {message}
      </p>
      {subtitle && (
        <p className="font-body text-[#8A8A8A] text-sm max-w-[240px] leading-[1.45] italic text-center">
          {subtitle}
        </p>
      )}
      {showBrowse && (
        <Link
          href="/library"
          className="mt-2 h-11 px-7 inline-flex items-center justify-center rounded-sm bg-primary text-void font-ui text-xs font-medium uppercase tracking-[0.25em] shadow-gold-glow transition-colors [@media(hover:hover)]:hover:bg-white active:scale-[0.98]"
        >
          Browse Catalog
        </Link>
      )}
    </div>
  );
}
