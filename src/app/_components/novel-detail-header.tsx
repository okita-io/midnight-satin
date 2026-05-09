"use client";

import React, { useTransition, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { AuthPrompt } from "./auth-prompt";
import { IconGhostButton } from "./button-primitives";

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
      <div className="pointer-events-auto">
        <IconGhostButton onClick={handleBack} aria-label="Go back">
          <span className="material-symbols-outlined text-shadow-sm">arrow_back</span>
        </IconGhostButton>
      </div>
      <div className="flex gap-3 pointer-events-auto">
        <IconGhostButton
          onClick={handleBookmark}
          disabled={isPending}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className="disabled:opacity-50 disabled:active:scale-100"
        >
          <span
            className="material-symbols-outlined text-shadow-sm"
            style={{ fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0" }}
          >
            bookmark
          </span>
        </IconGhostButton>
        <IconGhostButton onClick={handleShare} aria-label="Share">
          <span className="material-symbols-outlined text-shadow-sm">share</span>
        </IconGhostButton>
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
