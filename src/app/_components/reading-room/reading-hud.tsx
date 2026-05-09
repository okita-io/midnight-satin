"use client";

/**
 * Reading HUD: toggle overlay with header (back, chapter title, bookmark),
 * bottom nav (font settings, progress bar, chapter nav) (Req 3.5, 3.6, 3.8, 3.9).
 * Safe area insets applied (Req 3.10).
 */

import { useCallback, useState } from "react";
import { toggleBookmark } from "@/app/actions/bookmarks";
import { READING_HUD_FOOTER_ICON_ROW_CLASSES } from "@/lib/responsive/constants";
import { FixedBottomBar, ProgressBar } from "@/app/_components/chrome-primitives";
import {
  ReadingHudChapterNav,
  ReadingHudCommentsControl,
  ReadingHudFontControl,
  ReadingHudHeader,
  ReadingHudLineSpacingControl,
} from "./reading-hud-parts";
import {
  DEFAULT_READER_SETTINGS,
  getStoredReaderSettings,
  setStoredReaderSettings,
  type FontSize,
  type LineHeight,
  type ReaderSettings,
} from "./reading-hud-settings";

export type { FontSize, LineHeight, ReaderSettings };
export {
  DEFAULT_READER_SETTINGS,
  getStoredReaderSettings,
  setStoredReaderSettings,
} from "./reading-hud-settings";

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
  const [bookmarked, setBookmarked] = useState(() => initialBookmarked);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showLinePanel, setShowLinePanel] = useState(false);

  const handleBookmark = useCallback(async () => {
    if (!isAuthenticated) return;
    const result = await toggleBookmark(novelId);
    if (result.success) setBookmarked(result.bookmarked);
  }, [novelId, isAuthenticated]);

  if (!visible) return null;

  return (
    <>
      <ReadingHudHeader
        novelId={novelId}
        chapterId={chapterId}
        chapterNumber={chapterNumber}
        chapterTitle={chapterTitle}
        bookmarked={bookmarked}
        isAuthenticated={isAuthenticated}
        onBookmark={handleBookmark}
      />

      <FixedBottomBar className="flex min-w-0 flex-col" aria-label="Reading tools">
        <ProgressBar valuePercent={progressPercent} />

        <div className={READING_HUD_FOOTER_ICON_ROW_CLASSES}>
          <ReadingHudFontControl
            showPanel={showFontPanel}
            onTogglePanel={() => setShowFontPanel((v) => !v)}
            onCloseOtherPanel={() => setShowLinePanel(false)}
            fontSize={fontSize}
            onFontSizeChange={(s) => {
              onFontSizeChange(s);
              setShowFontPanel(false);
            }}
          />

          <ReadingHudChapterNav
            novelId={novelId}
            prevChapterId={prevChapterId}
            nextChapterId={nextChapterId}
            progressPercent={progressPercent}
          />

          <ReadingHudCommentsControl
            commentCount={commentCount}
            commentsActive={commentsActive}
            onCommentsClick={onCommentsClick}
          />

          <ReadingHudLineSpacingControl
            showPanel={showLinePanel}
            onTogglePanel={() => setShowLinePanel((v) => !v)}
            onCloseOtherPanel={() => setShowFontPanel(false)}
            lineHeight={lineHeight}
            onLineHeightChange={(lh) => {
              onLineHeightChange(lh);
              setShowLinePanel(false);
            }}
          />
        </div>
      </FixedBottomBar>
    </>
  );
}
