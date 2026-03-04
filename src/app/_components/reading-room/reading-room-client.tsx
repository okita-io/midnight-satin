"use client";

/**
 * Reading Room client orchestrator.
 * Tap center to toggle HUD, scroll progress, font settings persistence (Req 3.4-3.10).
 * No NavigationBar (Req 15.4).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { ChapterContent } from "./chapter-content";
import { ReadingHUD, getStoredReaderSettings, setStoredReaderSettings, type FontSize, type LineHeight } from "./reading-hud";

export interface ReadingRoomClientProps {
  novelId: string;
  novelTitle: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  content: string;
  prevChapterId: string | null;
  nextChapterId: string | null;
  isAuthenticated: boolean;
  initialBookmarked: boolean;
}

export function ReadingRoomClient({
  novelId,
  novelTitle,
  chapterId,
  chapterNumber,
  chapterTitle,
  content,
  prevChapterId,
  nextChapterId,
  isAuthenticated,
  initialBookmarked,
}: ReadingRoomClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hudVisible, setHudVisible] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [settings, setSettings] = useState(getStoredReaderSettings);

  useEffect(() => {
    setSettings(getStoredReaderSettings());
  }, []);

  const handleFontSizeChange = useCallback((fontSize: FontSize) => {
    const next = { ...getStoredReaderSettings(), fontSize };
    setStoredReaderSettings(next);
    setSettings(next);
  }, []);

  const handleLineHeightChange = useCallback((lineHeight: LineHeight) => {
    const next = { ...getStoredReaderSettings(), lineHeight };
    setStoredReaderSettings(next);
    setSettings(next);
  }, []);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    const pct = maxScroll <= 0 ? 100 : (scrollTop / maxScroll) * 100;
    setProgressPercent(pct);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    handleScroll();
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll, content]);

  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button")) return;
      setHudVisible((v) => !v);
    },
    []
  );

  return (
    <div className="h-screen flex flex-col bg-void overflow-hidden">
      {/* Main reading area - tap to toggle HUD */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative w-full scroll-smooth bg-silk-noise"
        onClick={handleTap}
        role="main"
        aria-label="Chapter content"
      >
        <div className="max-w-xl mx-auto px-6 pt-24 pb-32">
          <ChapterContent
            content={content}
            chapterTitle={chapterTitle}
            novelTitle={novelTitle}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
          />
        </div>
      </main>

      <ReadingHUD
        visible={hudVisible}
        novelId={novelId}
        chapterNumber={chapterNumber}
        chapterTitle={chapterTitle}
        progressPercent={progressPercent}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        isAuthenticated={isAuthenticated}
        initialBookmarked={initialBookmarked}
        fontSize={settings.fontSize}
        lineHeight={settings.lineHeight}
        onFontSizeChange={handleFontSizeChange}
        onLineHeightChange={handleLineHeightChange}
      />

      {/* Texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[60] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
