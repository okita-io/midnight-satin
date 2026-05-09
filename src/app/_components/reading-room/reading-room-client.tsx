"use client";

/**
 * Reading Room client orchestrator.
 * Tap center to toggle HUD, scroll progress, font settings persistence (Req 3.4-3.10).
 * Reading progress: 10s debounce save, scroll restoration (Req 3.7, 16.1, 16.2).
 * The Veil paywall for locked chapters (Req 4.1-4.6).
 * No NavigationBar (Req 15.4).
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import { saveReadingProgress } from "@/app/actions/reading-progress";
import { unlockChapter } from "@/app/actions/unlock-chapter";
import { ChapterContent } from "./chapter-content";
import { TheVeil } from "@/app/_components/the-veil";
import {
  ReadingHUD,
  getStoredReaderSettings,
  setStoredReaderSettings,
  type FontSize,
  type LineHeight,
} from "./reading-hud";
import { CommentsSection } from "./comments-section";
import { CommentsSidebar } from "./comments-sidebar";
import {
  createReadingRoomInitialState,
  readingRoomClientReducer,
} from "./reading-room-client-reducer";

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
  const [state, dispatch] = useReducer(
    readingRoomClientReducer,
    {
      chapterId,
      initialCommentCount,
      isUnlocked,
      initialCreditBalance,
    },
    (init) =>
      createReadingRoomInitialState(init.chapterId, {
        initialCommentCount: init.initialCommentCount,
        isUnlocked: init.isUnlocked,
        initialCreditBalance: init.initialCreditBalance,
      })
  );

  if (chapterId !== state.syncedChapterId) {
    dispatch({
      type: "sync_chapter_props",
      chapterId,
      initialCommentCount,
      isUnlocked,
      initialCreditBalance,
    });
  }

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRestoringRef = useRef(false);

  const showVeil = !isFree && !state.unlocked;

  const resolvedInitialPercent =
    isAuthenticated ? initialScrollPercent : getGuestScrollPercent(chapterId);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      dispatch({
        type: "set_settings",
        settings: getStoredReaderSettings(),
      });
    });
    return () => cancelAnimationFrame(id);
  }, []);

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
      dispatch({
        type: "set_progress_percent",
        percent: resolvedInitialPercent,
      });
      requestAnimationFrame(() => {
        isRestoringRef.current = false;
      });
    };

    restore();
    const raf = requestAnimationFrame(restore);
    return () => cancelAnimationFrame(raf);
  }, [chapterId, resolvedInitialPercent]);

  const scheduleSaveRef = useRef<(percent: number) => void>(() => {});
  const onScrollRef = useRef<() => void>(() => {});

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
    scheduleSaveRef.current = scheduleSave;
    onScrollRef.current = () => {
      const el = scrollRef.current;
      if (!el) return;
      const { scrollTop, scrollHeight, clientHeight } = el;
      const maxScroll = scrollHeight - clientHeight;
      const pct = maxScroll <= 0 ? 100 : (scrollTop / maxScroll) * 100;
      dispatch({ type: "set_progress_percent", percent: pct });
      if (!isRestoringRef.current) scheduleSaveRef.current(pct);
    };
  }, [scheduleSave]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleFontSizeChange = useCallback((fontSize: FontSize) => {
    const next = { ...getStoredReaderSettings(), fontSize };
    setStoredReaderSettings(next);
    dispatch({ type: "set_settings", settings: next });
  }, []);

  const handleLineHeightChange = useCallback((lineHeight: LineHeight) => {
    const next = { ...getStoredReaderSettings(), lineHeight };
    setStoredReaderSettings(next);
    dispatch({ type: "set_settings", settings: next });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const listener = () => onScrollRef.current();
    const raf = requestAnimationFrame(() => listener());
    el.addEventListener("scroll", listener, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", listener);
    };
  }, [content]);

  const shouldIgnoreToggleTarget = useCallback((el: HTMLElement | null) => {
    if (!el) return true;
    return !!(el.closest("a") || el.closest("button"));
  }, []);

  const handleTap = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (shouldIgnoreToggleTarget(target)) return;
    dispatch({ type: "toggle_hud" });
  }, [shouldIgnoreToggleTarget]);

  const handleTapKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      const target = e.target as HTMLElement;
      if (shouldIgnoreToggleTarget(target)) return;
      e.preventDefault();
      dispatch({ type: "toggle_hud" });
    },
    [shouldIgnoreToggleTarget]
  );

  const handleUnlock = useCallback(async () => {
    if (!isAuthenticated || state.creditBalance < 5 || state.isUnlocking) return;
    dispatch({ type: "unlock_start" });
    const result = await unlockChapter(chapterId);
    if (result.success) {
      dispatch({ type: "unlock_success", newBalance: result.newBalance });
    } else {
      dispatch({
        type: "unlock_fail",
        error: result.error ?? "Failed to unlock.",
      });
    }
  }, [chapterId, isAuthenticated, state.creditBalance, state.isUnlocking]);

  return (
    <div className="reading-room-root h-screen flex min-h-0 flex-col bg-void bg-silk-noise overflow-hidden text-text-main font-body antialiased selection:bg-primary/30 selection:text-white">
      <main
        ref={scrollRef}
        className="reading-room-main-scroll flex-1 min-h-0 overflow-y-auto relative w-full scroll-smooth bg-silk-noise lg:mr-80"
        onClick={handleTap}
        onKeyDown={handleTapKeyDown}
        role="main"
        aria-label="Chapter content"
      >
        <div className="mx-auto w-full max-w-xl px-4 xs:px-6 md:max-w-2xl md:px-10 pt-24 pb-32">
          <ChapterContent
            content={content}
            chapterTitle={chapterTitle}
            novelTitle={novelTitle}
            fontSize={state.settings.fontSize}
            lineHeight={state.settings.lineHeight}
            veilMode={showVeil}
            veilSlot={
              showVeil ? (
                <TheVeil
                  creditBalance={state.creditBalance}
                  isAuthenticated={isAuthenticated}
                  onUnlock={handleUnlock}
                  isUnlocking={state.isUnlocking}
                  error={state.unlockError}
                />
              ) : null
            }
          />
        </div>
      </main>

      <ReadingHUD
        key={chapterId}
        visible={state.hudVisible}
        novelId={novelId}
        chapterId={chapterId}
        chapterNumber={chapterNumber}
        chapterTitle={chapterTitle}
        progressPercent={state.progressPercent}
        prevChapterId={prevChapterId}
        nextChapterId={nextChapterId}
        isAuthenticated={isAuthenticated}
        initialBookmarked={initialBookmarked}
        commentCount={state.commentCount}
        commentsActive={state.commentsOpen}
        onCommentsClick={() =>
          dispatch({ type: "set_comments_open", open: !state.commentsOpen })
        }
        fontSize={state.settings.fontSize}
        lineHeight={state.settings.lineHeight}
        onFontSizeChange={handleFontSizeChange}
        onLineHeightChange={handleLineHeightChange}
      />

      <CommentsSection
        isOpen={state.commentsOpen}
        onClose={() => dispatch({ type: "set_comments_open", open: false })}
        chapterId={chapterId}
        isAuthenticated={isAuthenticated}
        commentCount={state.commentCount}
        onCommentCountChange={(count) =>
          dispatch({ type: "set_comment_count", count })
        }
        returnUrl={`/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`}
      />

      <CommentsSidebar
        chapterId={chapterId}
        isAuthenticated={isAuthenticated}
        commentCount={state.commentCount}
        readingHudVisible={state.hudVisible}
        onCommentCountChange={(count) =>
          dispatch({ type: "set_comment_count", count })
        }
        returnUrl={`/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chapterId)}`}
      />

      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03] z-[60] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.5'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}
