"use client";

/**
 * Reading Room client orchestrator.
 * Tap center to toggle HUD, scroll progress, font settings persistence (Req 3.4-3.10).
 * Reading progress: 10s debounce save, scroll restoration (Req 3.7, 16.1, 16.2).
 * The Veil paywall for locked chapters (Req 4.1-4.6).
 * No NavigationBar (Req 15.4).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { saveReadingProgress } from "@/app/actions/reading-progress";
import { unlockChapter } from "@/app/actions/unlock-chapter";
import { ChapterContent } from "./chapter-content";
import { TheVeil } from "@/app/_components/the-veil";
import {
  ReadingHUD,
  DEFAULT_READER_SETTINGS,
  getStoredReaderSettings,
  setStoredReaderSettings,
  type FontSize,
  type LineHeight,
  type ReaderSettings,
} from "./reading-hud";
import { CommentsSection } from "./comments-section";
import { CommentsSidebar } from "./comments-sidebar";

const GUEST_PROGRESS_KEY = "reading-progress";
const SAVE_DEBOUNCE_MS = 10_000;

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
  initialScrollPercent?: number;
  isFree: boolean;
  isUnlocked: boolean;
  initialCreditBalance: number;
  initialCommentCount: number;
}

function getGuestScrollPercent(chapterId: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(GUEST_PROGRESS_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw) as Record<string, number>;
    return data[chapterId] ?? 0;
  } catch {
    return 0;
  }
}

function setGuestScrollPercent(chapterId: string, percent: number): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(GUEST_PROGRESS_KEY);
    const data: Record<string, number> = raw ? JSON.parse(raw) : {};
    data[chapterId] = percent;
    localStorage.setItem(GUEST_PROGRESS_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
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
  initialScrollPercent = 0,
  isFree,
  isUnlocked,
  initialCreditBalance,
  initialCommentCount = 0,
}: ReadingRoomClientProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hudVisible, setHudVisible] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const [progressPercent, setProgressPercent] = useState(0);
  /** Same defaults as SSR so ChapterContent matches server HTML; localStorage applied after mount. */
  const [settings, setSettings] = useState<ReaderSettings>(() => ({
    ...DEFAULT_READER_SETTINGS,
  }));

  useEffect(() => {
    setSettings(getStoredReaderSettings());
  }, []);
  const [unlocked, setUnlocked] = useState(isUnlocked);
  const [creditBalance, setCreditBalance] = useState(initialCreditBalance);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoringRef = useRef(false);

  const showVeil = !isFree && !unlocked;


  // Resolve initial scroll: server for auth, localStorage for guests (Req 16.2)
  const resolvedInitialPercent =
    isAuthenticated ? initialScrollPercent : getGuestScrollPercent(chapterId);

  // Restore scroll position on mount (Req 16.2)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || resolvedInitialPercent <= 0) return;

    isRestoringRef.current = true;
    const restore = () => {
      const { scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      if (maxScroll <= 0) return;
      const scrollTop = (resolvedInitialPercent / 100) * maxScroll;
      el.scrollTop = scrollTop;
      setProgressPercent(resolvedInitialPercent);
      // Allow saves after restore completes
      requestAnimationFrame(() => {
        isRestoringRef.current = false;
      });
    };

    restore();
    const raf = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(raf);
  }, [chapterId, resolvedInitialPercent]);

  // Debounced save: 10s after last scroll (Req 16.1)
  const scheduleSave = useCallback(
    (percent: number) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        if (isAuthenticated) {
          saveReadingProgress(chapterId, percent);
        } else {
          setGuestScrollPercent(chapterId, percent);
        }
      }, SAVE_DEBOUNCE_MS);
    },
    [chapterId, isAuthenticated]
  );

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
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
    if (!isRestoringRef.current) scheduleSave(pct);
  }, [scheduleSave]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const raf = requestAnimationFrame(() => handleScroll());
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, content]);

  const handleTap = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a") || target.closest("button")) return;
      setHudVisible((v) => !v);
    },
    []
  );

  const handleUnlock = useCallback(async () => {
    if (!isAuthenticated || creditBalance < 5 || isUnlocking) return;
    setUnlockError(null);
    setIsUnlocking(true);
    const result = await unlockChapter(chapterId);
    setIsUnlocking(false);
    if (result.success) {
      setUnlocked(true);
      setCreditBalance(result.newBalance);
    } else {
      setUnlockError(result.error ?? "Failed to unlock.");
    }
  }, [chapterId, isAuthenticated, creditBalance, isUnlocking]);

  return (
    <div className="h-screen flex flex-col bg-void bg-silk-noise overflow-hidden text-text-main font-body antialiased selection:bg-primary/30 selection:text-white">
      {/* Main reading area - tap to toggle HUD */}
      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto relative w-full scroll-smooth bg-silk-noise lg:pr-80"
        onClick={handleTap}
        role="main"
        aria-label="Chapter content"
      >
          <div className="max-w-xl md:max-w-2xl mx-auto px-4 xs:px-6 md:px-10 pt-24 pb-32">
          <ChapterContent
            content={content}
            chapterTitle={chapterTitle}
            novelTitle={novelTitle}
            fontSize={settings.fontSize}
            lineHeight={settings.lineHeight}
            veilMode={showVeil}
            veilSlot={
              showVeil ? (
                <TheVeil
                  creditBalance={creditBalance}
                  isAuthenticated={isAuthenticated}
                  onUnlock={handleUnlock}
                  isUnlocking={isUnlocking}
                  error={unlockError}
                />
              ) : null
            }
          />
        </div>
      </main>

      <ReadingHUD
        visible={hudVisible}
        novelId={novelId}
        chapterId={chapterId}
        chapterNumber={chapterNumber}
        chapterTitle={chapterTitle}
        progressPercent={progressPercent}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        isAuthenticated={isAuthenticated}
        initialBookmarked={initialBookmarked}
        commentCount={commentCount}
        commentsActive={commentsOpen}
        onCommentsClick={() => setCommentsOpen((o) => !o)}
        fontSize={settings.fontSize}
        lineHeight={settings.lineHeight}
        onFontSizeChange={handleFontSizeChange}
        onLineHeightChange={handleLineHeightChange}
      />

      {/* Mobile/tablet: bottom sheet when comments tapped */}
      <CommentsSection
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        chapterId={chapterId}
        isAuthenticated={isAuthenticated}
        commentCount={commentCount}
        onCommentCountChange={setCommentCount}
        returnUrl={`/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`}
      />

      {/* Desktop (lg:): fixed sidebar always visible */}
      <CommentsSidebar
        chapterId={chapterId}
        isAuthenticated={isAuthenticated}
        commentCount={commentCount}
        readingHudVisible={hudVisible}
        onCommentCountChange={setCommentCount}
        returnUrl={`/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`}
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
