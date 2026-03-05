"use client";

/**
 * Reading HUD: toggle overlay with header (back, chapter title, bookmark),
 * footer (font settings, progress bar, chapter nav) (Req 3.5, 3.6, 3.8, 3.9).
 * Safe area insets applied (Req 3.10).
 */

import Link from "next/link";
import { useCallback, useState } from "react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { novelDetailPath } from "@/lib/navigation";

function toRoman(num: number): string {
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let result = "";
  let n = num;
  for (const [val, sym] of map) {
    while (n >= val) {
      result += sym;
      n -= val;
    }
  }
  return result || "I";
}

const FONT_SIZES = [16, 18, 20] as const;
const LINE_HEIGHTS = [1.4, 1.6, 1.8] as const;

export type FontSize = (typeof FONT_SIZES)[number];
export type LineHeight = (typeof LINE_HEIGHTS)[number];

const STORAGE_KEY = "midnight-satin-reader-settings";

export interface ReaderSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
}

export function getStoredReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") {
    return { fontSize: 18, lineHeight: 1.6 };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { fontSize: 18, lineHeight: 1.6 };
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      fontSize: FONT_SIZES.includes(parsed.fontSize as FontSize)
        ? (parsed.fontSize as FontSize)
        : 18,
      lineHeight: LINE_HEIGHTS.includes(parsed.lineHeight as LineHeight)
        ? (parsed.lineHeight as LineHeight)
        : 1.6,
    };
  } catch {
    return { fontSize: 18, lineHeight: 1.6 };
  }
}

export function setStoredReaderSettings(settings: ReaderSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}

export interface ReadingHUDProps {
  visible: boolean;
  novelId: string;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  progressPercent: number;
  prevChapterId: string | null;
  nextChapterId: string | null;
  isAuthenticated: boolean;
  initialBookmarked: boolean;
  commentCount: number;
  commentsActive?: boolean;
  onCommentsClick: () => void;
  fontSize: FontSize;
  lineHeight: LineHeight;
  onFontSizeChange: (size: FontSize) => void;
  onLineHeightChange: (lh: LineHeight) => void;
}

export function ReadingHUD({
  visible,
  novelId,
  chapterId,
  chapterNumber,
  chapterTitle,
  progressPercent,
  prevChapterId,
  nextChapterId,
  isAuthenticated,
  initialBookmarked,
  commentCount,
  commentsActive = false,
  onCommentsClick,
  fontSize,
  lineHeight,
  onFontSizeChange,
  onLineHeightChange,
}: ReadingHUDProps) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showLinePanel, setShowLinePanel] = useState(false);

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated) return;
    const result = await toggleBookmark(novelId);
    if (result.success) setBookmarked(result.bookmarked);
  }, [novelId, isAuthenticated]);

  const readingRoomPath = (chId: string) =>
    `/novel/${encodeURIComponent(novelId)}/read/${encodeURIComponent(chId)}`;

  if (!visible) return null;

  return (
    <>
      {/* Header HUD */}
      <header
        className="fixed top-0 left-0 w-full z-50 transition-transform duration-300 bg-gradient-to-b from-void via-void/90 to-transparent pt-[var(--safe-area-inset-top)] pb-8 pointer-events-none"
        style={{ paddingTop: "calc(var(--safe-area-inset-top) + 0.5rem)" }}
      >
        <div className="flex items-center justify-between px-4 h-16 pointer-events-auto max-w-md mx-auto">
          <Link
            href={novelDetailPath(novelId)}
            className="w-10 h-10 flex items-center justify-center text-primary/80 hover:text-primary transition-colors active:scale-95"
            aria-label="Back to novel"
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 28 }}
            >
              arrow_back
            </span>
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-xs font-header tracking-[0.15em] text-text-muted uppercase">
              Chapter {toRoman(chapterNumber)}
            </span>
            <span className="text-sm font-display text-text-main italic">
              {chapterTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={handleBookmark}
            className="w-10 h-10 flex items-center justify-center text-primary/80 hover:text-primary transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
            disabled={!isAuthenticated}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 24,
                fontVariationSettings: bookmarked ? "'FILL' 1" : "'FILL' 0",
              }}
            >
              bookmark
            </span>
          </button>
        </div>
      </header>

      {/* Footer HUD with ProgressBar */}
      <footer
        className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0a0a] border-t border-white/5 shadow-2xl shadow-black md:max-w-md md:left-1/2 md:right-auto md:-translate-x-1/2"
        style={{
          paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 relative">
          <div
            className="absolute left-0 top-0 h-full bg-primary transition-all duration-300"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              boxShadow: "0 0 10px rgba(212,175,55,0.5)",
            }}
          />
        </div>

        <div className="px-6 py-4 flex items-center justify-evenly w-full">
          {/* Font panel toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowFontPanel((v) => !v);
                setShowLinePanel(false);
              }}
              className="flex flex-col items-center gap-1 text-text-muted hover:text-white transition-colors"
              aria-label="Font settings"
              aria-expanded={showFontPanel}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 24 }}
              >
                text_fields
              </span>
              <span className="text-[10px] font-ui uppercase tracking-wider">
                Type
              </span>
            </button>
            {showFontPanel && (
              <div className="absolute bottom-full left-0 mb-2 p-3 rounded bg-surface border border-white/10 shadow-lg flex gap-2">
                {FONT_SIZES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onFontSizeChange(s);
                      setShowFontPanel(false);
                    }}
                    className={`px-3 py-1 rounded text-sm font-ui ${
                      fontSize === s
                        ? "bg-primary text-void"
                        : "bg-white/5 text-text-main hover:bg-white/10"
                    }`}
                  >
                    {s}px
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapter nav */}
          <div className="flex flex-col items-center shrink-0">
            <div className="w-full flex justify-between text-[10px] font-ui text-text-muted uppercase tracking-wider mb-2">
              <span>Prev</span>
              <span>{Math.round(progressPercent)}%</span>
              <span>Next</span>
            </div>
            <div className="flex items-center gap-6 text-text-main">
              {prevChapterId ? (
                <Link
                  href={readingRoomPath(prevChapterId)}
                  className="hover:text-primary transition-colors"
                  aria-label="Previous chapter"
                >
                  <span className="material-symbols-outlined">
                    skip_previous
                  </span>
                </Link>
              ) : (
                <span className="text-text-muted/50 cursor-default">
                  <span className="material-symbols-outlined">
                    skip_previous
                  </span>
                </span>
              )}
              <Link
                href={novelDetailPath(novelId)}
                className="hover:text-primary transition-colors"
                aria-label="Chapter list"
              >
                <span className="material-symbols-outlined">play_circle</span>
              </Link>
              {nextChapterId ? (
                <Link
                  href={readingRoomPath(nextChapterId)}
                  className="hover:text-primary transition-colors"
                  aria-label="Next chapter"
                >
                  <span className="material-symbols-outlined">skip_next</span>
                </Link>
              ) : (
                <span className="text-text-muted/50 cursor-default">
                  <span className="material-symbols-outlined">skip_next</span>
                </span>
              )}
            </div>
          </div>

          {/* Comments toggle */}
          <button
            type="button"
            onClick={onCommentsClick}
            className={`relative flex flex-col items-center gap-1 transition-colors ${
              commentsActive ? "text-primary" : "text-text-muted hover:text-white"
            }`}
            aria-label={`Comments (${commentCount})`}
            aria-pressed={commentsActive}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: 24 }}
            >
              history_edu
            </span>
            <span className="text-[10px] font-ui uppercase tracking-wider">
              Notes
            </span>
            {commentCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-void min-w-[18px]">
                {commentCount > 99 ? "99+" : commentCount}
              </span>
            )}
          </button>

          {/* Line spacing toggle */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowLinePanel((v) => !v);
                setShowFontPanel(false);
              }}
              className="flex flex-col items-center gap-1 text-text-muted hover:text-white transition-colors"
              aria-label="Line spacing"
              aria-expanded={showLinePanel}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 24 }}
              >
                format_line_spacing
              </span>
              <span className="text-[10px] font-ui uppercase tracking-wider">
                Line
              </span>
            </button>
            {showLinePanel && (
              <div className="absolute bottom-full right-0 mb-2 p-3 rounded bg-surface border border-white/10 shadow-lg flex gap-2">
                {LINE_HEIGHTS.map((lh) => (
                  <button
                    key={lh}
                    type="button"
                    onClick={() => {
                      onLineHeightChange(lh);
                      setShowLinePanel(false);
                    }}
                    className={`px-3 py-1 rounded text-sm font-ui ${
                      lineHeight === lh
                        ? "bg-primary text-void"
                        : "bg-white/5 text-text-main hover:bg-white/10"
                    }`}
                  >
                    {lh}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
