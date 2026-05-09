"use client";

/**
 * Reading HUD: toggle overlay with header (back, chapter title, bookmark),
 * bottom nav (font settings, progress bar, chapter nav) (Req 3.5, 3.6, 3.8, 3.9).
 * Safe area insets applied (Req 3.10).
 */

import Link from "next/link";
import { useCallback, useState } from "react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { novelDetailPath } from "@/lib/navigation";
import { READING_HUD_FOOTER_ICON_ROW_CLASSES } from "@/lib/responsive/constants";
import { SegmentedChips } from "@/app/_components/segmented-chips";
import { FixedBottomBar, ProgressBar, GradientHeaderStrip } from "@/app/_components/chrome-primitives";

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

/** Matches SSR and empty localStorage; use for initial client state before hydration completes. */
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.6,
};

export function getStoredReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_READER_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_READER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      fontSize: FONT_SIZES.includes(parsed.fontSize as FontSize)
        ? (parsed.fontSize as FontSize)
        : DEFAULT_READER_SETTINGS.fontSize,
      lineHeight: LINE_HEIGHTS.includes(parsed.lineHeight as LineHeight)
        ? (parsed.lineHeight as LineHeight)
        : DEFAULT_READER_SETTINGS.lineHeight,
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
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
        className="fixed top-0 left-0 w-full z-50 transition-transform duration-300 pt-[var(--safe-area-inset-top)] pb-8 pointer-events-none"
        style={{ paddingTop: "calc(var(--safe-area-inset-top) + 0.5rem)" }}
      >
        <GradientHeaderStrip className="absolute inset-0" />
        <div className="flex items-center justify-between px-4 md:px-8 h-16 pointer-events-auto max-w-md md:max-w-2xl mx-auto">
          <Link
            href={novelDetailPath(novelId)}
            className="w-10 h-10 flex items-center justify-center text-primary/80 hover:text-primary transition-colors active:scale-95 cursor-pointer"
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
            className="w-10 h-10 flex items-center justify-center text-primary/80 hover:text-primary transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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

      {/* Bottom bar: same shell as main NavigationBar (full-bleed drawer) */}
      <FixedBottomBar
        className="flex min-w-0 flex-col"
        aria-label="Reading tools"
      >
        {/* Progress Bar */}
        <ProgressBar valuePercent={progressPercent} />

        <div className={READING_HUD_FOOTER_ICON_ROW_CLASSES}>
          {/* Font panel toggle — column 1 (match NavTabLink: icon over label) */}
          <div className="relative z-10 flex min-w-0 flex-col items-center justify-end md:min-w-0 md:flex-1">
            <button
              type="button"
              onClick={() => {
                setShowFontPanel((v) => !v);
                setShowLinePanel(false);
              }}
              className={`flex w-full min-w-0 max-w-full flex-col items-center gap-1.5 transition-colors duration-300 ease-in-out cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm ${
                showFontPanel
                  ? "text-primary"
                  : "text-text-muted hover:text-white"
              }`}
              aria-label="Font settings"
              aria-expanded={showFontPanel}
            >
              <span
                className="material-symbols-outlined transition-all duration-300 ease-in-out"
                style={{
                  fontSize: showFontPanel ? 28 : 24,
                  color: "inherit",
                  ...(showFontPanel && {
                    filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))",
                  }),
                }}
              >
                text_fields
              </span>
              <span
                className={`text-[10px] md:text-xs font-ui md:font-header font-medium tracking-wider md:tracking-[0.2em] uppercase ${
                  showFontPanel ? "text-primary" : ""
                }`}
              >
                Type
              </span>
            </button>
            {showFontPanel && (
              <div className="absolute bottom-full left-0 mb-2 p-3 rounded bg-surface border border-[#1F1F1F] shadow-lg">
                <SegmentedChips
                  label="Font size"
                  value={fontSize}
                  options={FONT_SIZES.map((s) => ({ value: s, label: `${s}px` }))}
                  onChange={(s) => {
                    onFontSizeChange(s);
                    setShowFontPanel(false);
                  }}
                />
              </div>
            )}
          </div>

          {/* Chapter — column 2: three NavTabLink-style stacks (icon over label) */}
          <div
            className="z-0 flex min-w-0 min-h-0 flex-col items-center justify-end px-0 md:min-w-0 md:max-w-none md:flex-[1.4]"
            role="group"
            aria-label="Chapter navigation"
          >
            <div
              className="flex w-full min-w-0 max-w-full flex-row items-end justify-center gap-0.5 min-[400px]:gap-1.5 sm:gap-2 md:gap-5 lg:gap-8"
              style={{ minWidth: 0 }}
            >
              {/* Previous */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                {prevChapterId ? (
                  <Link
                    href={readingRoomPath(prevChapterId)}
                    className="relative flex items-center justify-center text-text-main transition-transform duration-300 ease-in-out hover:text-primary active:scale-95"
                    aria-label="Previous chapter"
                  >
                    <span
                      className="material-symbols-outlined transition-[font-size,filter] duration-300 ease-in-out"
                      style={{ fontSize: 24, lineHeight: 1 }}
                    >
                      skip_previous
                    </span>
                  </Link>
                ) : (
                  <span
                    className="relative flex items-center justify-center text-text-muted/50"
                    aria-hidden
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 24, lineHeight: 1 }}
                    >
                      skip_previous
                    </span>
                  </span>
                )}
                <span className="max-w-full truncate text-center text-[9px] font-ui font-medium uppercase text-text-muted tabular-nums tracking-wider min-[400px]:text-[10px] sm:text-xs md:font-header md:tracking-[0.15em]">
                  Prev
                </span>
              </div>
              {/* Center: list + progress (label matches progress) */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                <Link
                  href={novelDetailPath(novelId)}
                  className="relative flex items-center justify-center text-text-main transition-transform duration-300 ease-in-out hover:text-primary active:scale-95"
                  aria-label="Chapter list"
                >
                  <span
                    className="material-symbols-outlined transition-[font-size,filter] duration-300 ease-in-out"
                    style={{ fontSize: 24, lineHeight: 1 }}
                  >
                    play_circle
                  </span>
                </Link>
                <span className="max-w-full text-center text-[9px] font-ui font-medium tabular-nums text-text-muted tracking-wider min-[400px]:text-[10px] sm:text-xs md:font-header md:tracking-[0.15em]">
                  {Math.round(progressPercent)}%
                </span>
              </div>
              {/* Next */}
              <div className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
                {nextChapterId ? (
                  <Link
                    href={readingRoomPath(nextChapterId)}
                    className="relative flex items-center justify-center text-text-main transition-transform duration-300 ease-in-out hover:text-primary active:scale-95"
                    aria-label="Next chapter"
                  >
                    <span
                      className="material-symbols-outlined transition-[font-size,filter] duration-300 ease-in-out"
                      style={{ fontSize: 24, lineHeight: 1 }}
                    >
                      skip_next
                    </span>
                  </Link>
                ) : (
                  <span
                    className="relative flex items-center justify-center text-text-muted/50"
                    aria-hidden
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: 24, lineHeight: 1 }}
                    >
                      skip_next
                    </span>
                  </span>
                )}
                <span className="max-w-full truncate text-center text-[9px] font-ui font-medium uppercase text-text-muted tabular-nums tracking-wider min-[400px]:text-[10px] sm:text-xs md:font-header md:tracking-[0.15em]">
                  Next
                </span>
              </div>
            </div>
          </div>

          {/* Comments toggle — column 3 */}
          <button
            type="button"
            onClick={onCommentsClick}
            className={`relative z-10 flex w-full min-w-0 max-w-full min-h-0 flex-col items-center gap-1.5 rounded-sm transition-colors duration-300 ease-in-out cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void md:min-w-0 md:flex-1 ${
              commentsActive
                ? "text-primary"
                : "text-text-muted hover:text-white"
            }`}
            aria-label={`Comments (${commentCount})`}
            aria-pressed={commentsActive}
          >
            <span
              className="material-symbols-outlined transition-all duration-300 ease-in-out"
              style={{
                fontSize: commentsActive ? 28 : 24,
                color: "inherit",
                ...(commentsActive && {
                  filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))",
                }),
              }}
            >
              history_edu
            </span>
            <span
              className={`text-[10px] md:text-xs font-ui font-medium tracking-wider md:font-header md:tracking-[0.2em] uppercase ${
                commentsActive ? "text-primary" : ""
              }`}
            >
              Notes
            </span>
            {commentCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full border border-void min-w-[18px]">
                {commentCount > 99 ? "99+" : commentCount}
              </span>
            )}
          </button>

          {/* Line spacing toggle — column 4 */}
          <div className="relative z-10 flex min-w-0 max-w-full min-h-0 flex-col items-center justify-end md:min-w-0 md:flex-1">
            <button
              type="button"
              onClick={() => {
                setShowLinePanel((v) => !v);
                setShowFontPanel(false);
              }}
              className={`flex w-full min-w-0 max-w-full flex-col items-center gap-1.5 transition-colors duration-300 ease-in-out cursor-pointer active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-void rounded-sm ${
                showLinePanel
                  ? "text-primary"
                  : "text-text-muted hover:text-white"
              }`}
              aria-label="Line spacing"
              aria-expanded={showLinePanel}
            >
              <span
                className="material-symbols-outlined transition-all duration-300 ease-in-out"
                style={{
                  fontSize: showLinePanel ? 28 : 24,
                  color: "inherit",
                  ...(showLinePanel && {
                    filter: "drop-shadow(0 0 8px rgba(212,175,55,0.6))",
                  }),
                }}
              >
                format_line_spacing
              </span>
              <span
                className={`text-[10px] md:text-xs font-ui font-medium tracking-wider md:font-header md:tracking-[0.2em] uppercase ${
                  showLinePanel ? "text-primary" : ""
                }`}
              >
                Line
              </span>
            </button>
            {showLinePanel && (
              <div className="absolute bottom-full right-0 mb-2 p-3 rounded bg-surface border border-[#1F1F1F] shadow-lg">
                <SegmentedChips
                  label="Line spacing"
                  value={lineHeight}
                  options={LINE_HEIGHTS.map((lh) => ({ value: lh, label: `${lh}×` }))}
                  onChange={(lh) => {
                    onLineHeightChange(lh);
                    setShowLinePanel(false);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </FixedBottomBar>
    </>
  );
}
