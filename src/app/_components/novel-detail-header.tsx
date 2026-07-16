"use client";

import React, { useTransition, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon, Button } from "@/components/ui";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { AuthPrompt } from "./auth-prompt";
import { GradientHeaderStrip } from "./chrome-primitives";

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
  const { back } = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [bookmarked, setBookmarked] = React.useState(() => initialBookmarked);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);

  const handleBack = () => back();

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
      className="fixed top-0 left-0 right-0 z-50 p-3 xs:p-4 flex justify-between items-center w-full pointer-events-none"
      style={{ paddingTop: "calc(1rem + env(safe-area-inset-top, 0px))" }}
    >
      <GradientHeaderStrip className="absolute inset-0" />
      <div className="pointer-events-auto">
        <Button variant="iconGhost" onClick={handleBack} aria-label="Go back">
          <Icon name="arrow_back" className="text-shadow-sm" />
        </Button>
      </div>
      <div className="flex gap-3 pointer-events-auto">
        <Button
          variant="iconGhost"
          onClick={handleBookmark}
          disabled={isPending}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className="disabled:opacity-50 disabled:active:scale-100"
        >
          <Icon name="bookmark" filled={bookmarked} className="text-shadow-sm" />
        </Button>
        <Button variant="iconGhost" onClick={handleShare} aria-label="Share">
          <Icon name="share" className="text-shadow-sm" />
        </Button>
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
