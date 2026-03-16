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
    <div className={`flex flex-col items-center gap-6 relative ${className}`}>
      <div className="absolute w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="w-24 h-24 rounded-full border border-primary/20 bg-primary/5 flex items-center justify-center">
        <span
          className="material-symbols-outlined text-primary/40 text-4xl"
          aria-hidden
        >
          auto_stories
        </span>
      </div>
      <p className="font-script text-3xl text-primary text-center opacity-90">
        {message}
      </p>
      {subtitle && (
        <p className="text-text-muted/60 text-sm max-w-[240px] leading-relaxed italic text-center">
          {subtitle}
        </p>
      )}
      {showBrowse && (
        <Link
          href="/library"
          className="mt-2 px-6 py-2.5 bg-primary text-void font-ui font-bold text-xs uppercase tracking-widest rounded-sm shadow-[0_0_20px_rgba(212,175,53,0.2)] hover:bg-white transition-colors"
        >
          Browse Catalog
        </Link>
      )}
    </div>
  );
}
