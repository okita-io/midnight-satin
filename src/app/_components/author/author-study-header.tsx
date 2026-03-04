"use client";

import Link from "next/link";

interface AuthorStudyHeaderProps {
  authorName: string;
}

export function AuthorStudyHeader({ authorName }: AuthorStudyHeaderProps) {
  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: authorName, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          navigator.clipboard?.writeText(url).catch(() => {});
        }
      }
    } else {
      navigator.clipboard?.writeText(url).catch(() => {});
    }
  };

  return (
    <header
      className="sticky top-0 z-50 flex items-center justify-between bg-void/80 backdrop-blur-md border-b border-[#393528]/30 px-4 py-3"
      style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top, 0px))" }}
    >
      <Link
        href="/"
        className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/5 transition-colors"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined text-2xl">arrow_back</span>
      </Link>
      <h2 className="text-text-main font-header tracking-widest text-sm font-medium uppercase text-center flex-1">
        The Author&apos;s Study
      </h2>
      <button
        type="button"
        onClick={handleShare}
        className="text-primary flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-white/5 transition-colors"
        aria-label="Share"
      >
        <span className="material-symbols-outlined text-2xl">share</span>
      </button>
    </header>
  );
}
