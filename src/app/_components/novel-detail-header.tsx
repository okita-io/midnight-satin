"use client";

import React, { useTransition, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { AuthPrompt } from "./auth-prompt";

interface NovelDetailHeaderProps {
  novelId: string;
  novelTitle: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
}

export function NovelDetailHeader({
  novelId,
  novelTitle,
  initialBookmarked,
  isAuthenticated,
}: NovelDetailHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [bookmarked, setBookmarked] = React.useState(initialBookmarked);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const handleBack = () => router.back();

  const handleBookmark = () => {
    if (!isAuthenticated) {
      setAuthPromptOpen(true);
      return;
    }
    startTransition(async () => {
      const result = await toggleBookmark(novelId);
      if (result.success) setBookmarked(result.bookmarked);
    });
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: novelTitle, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") fallbackCopy(url);
      }
    } else {
      fallbackCopy(url);
    }
  };

  function fallbackCopy(url: string) {
    navigator.clipboard?.writeText(url).catch(() => {});
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 p-3 xs:p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent w-full pointer-events-none"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
    >
      <button
        type="button"
        onClick={handleBack}
        className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors cursor-pointer active:scale-95"
        aria-label="Go back"
      >
        <span className="material-symbols-outlined text-shadow-sm">arrow_back</span>
      </button>
      <div className="flex gap-3 pointer-events-auto">
        <button
          type="button"
          onClick={handleBookmark}
          disabled={isPending}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors disabled:opacity-50 cursor-pointer active:scale-95 disabled:active:scale-100"
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <span
            className="material-symbols-outlined text-shadow-sm"
            style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-surface/30 backdrop-blur-md text-white border border-white/10 hover:bg-surface/50 transition-colors cursor-pointer active:scale-95"
          aria-label="Share"
        >
          <span className="material-symbols-outlined text-shadow-sm">share</span>
        </button>
      </div>
      <AuthPrompt
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        returnUrl={pathname ?? undefined}
        message="Log in to bookmark novels"
      />
    </div>
  );
}
