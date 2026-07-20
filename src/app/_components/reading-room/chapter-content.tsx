/**
 * Chapter content with drop cap, paragraphs, ornamental dividers (Req 3.1-3.3).
 * Supports progressive blur for The Veil paywall (Req 4.1): 1px, 3px, 6px blur levels.
 */

import { OrnamentalDivider } from "./ornamental-divider";
import {
  FREE_PREVIEW_PARAGRAPHS,
  VEIL_BLURRED_TEASER_PARAGRAPHS,
  splitChapterParagraphs,
} from "@/lib/reading/veil-content";

export {
  FREE_PREVIEW_PARAGRAPHS,
  VEIL_BLURRED_TEASER_PARAGRAPHS,
} from "@/lib/reading/veil-content";

const ORNAMENTAL_EVERY_N_PARAGRAPHS = 4;

/** Stable list keys: index + content fingerprint (avoids index-only keys when paragraphs shift). */
function paragraphStableKey(scope: string, index: number, text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `${scope}-${index}-${(h >>> 0).toString(36)}`;
}

/** Blur levels: 1px/60%, 3px/40%, 6px/20% per design reference (Req 4.1). Exported for Property 17 tests. */
export const BLUR_LEVELS: { blur: string; opacity: string }[] = [
  { blur: "blur-[1px]", opacity: "opacity-60" },
  { blur: "blur-[3px]", opacity: "opacity-40" },
  { blur: "blur-[6px]", opacity: "opacity-20" },
];

export interface ChapterContentProps {
  content: string;
  chapterTitle: string;
  novelTitle: string;
  fontSize?: 16 | 18 | 20;
  lineHeight?: 1.4 | 1.5 | 1.6 | 1.8;
  /** When true, show free preview + progressively blurred content (Req 4.1). */
  veilMode?: boolean;
  /** Slot for TheVeil overlay (rendered inside blurred section when veilMode). */
  veilSlot?: React.ReactNode;
}

export function ChapterContent({
  content,
  chapterTitle,
  novelTitle,
  fontSize = 18,
  lineHeight = 1.6,
  veilMode = false,
  veilSlot,
}: ChapterContentProps) {
  const paragraphs = splitChapterParagraphs(content);

  if (paragraphs.length === 0) {
    return (
      <article className="w-full mx-auto text-text-main/90 font-body text-justify">
        <p className="text-text-muted italic">No content yet.</p>
      </article>
    );
  }

  const freeEnd = veilMode
    ? Math.min(FREE_PREVIEW_PARAGRAPHS, paragraphs.length)
    : paragraphs.length;
  const blurredStart = freeEnd;
  const blurredEnd = veilMode
    ? Math.min(
        paragraphs.length,
        blurredStart + VEIL_BLURRED_TEASER_PARAGRAPHS
      )
    : paragraphs.length;
  const blurredSlice = paragraphs.slice(blurredStart, blurredEnd);
  const blurredCount = blurredSlice.length;

  return (
    <article
      className="w-full mx-auto text-text-main/90 font-body text-justify"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight,
      }}
    >
      {/* Chapter title block */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary" />
          <span className="size-2 rotate-45 border border-primary bg-void" />
          <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-primary" />
        </div>
        <h1 className="font-display italic text-4xl text-primary mb-2 drop-shadow-md">
          {chapterTitle}
        </h1>
        <p className="font-ui text-xs tracking-widest text-text-muted uppercase">
          {novelTitle}
        </p>
      </div>

      {/* Free preview paragraphs */}
      {paragraphs.slice(0, freeEnd).map((text, i) => {
        const isFirst = i === 0;
        const showDivider =
          i > 0 && i % ORNAMENTAL_EVERY_N_PARAGRAPHS === 0;
        return (
          <div key={paragraphStableKey("free", i, text)}>
            {showDivider && <OrnamentalDivider />}
            <p className={isFirst ? "drop-cap mb-6" : "mb-6"}>{text}</p>
          </div>
        );
      })}

      {/* Progressively blurred content + Veil overlay (Req 4.1) */}
      {veilMode && blurredCount > 0 && (
        <div className="relative">
          {blurredSlice.map((text, i) => {
            const level =
              BLUR_LEVELS[Math.min(i, BLUR_LEVELS.length - 1)];
            const showDivider =
              (blurredStart + i) > 0 &&
              (blurredStart + i) % ORNAMENTAL_EVERY_N_PARAGRAPHS === 0;
            return (
              <div
                key={paragraphStableKey("veil", blurredStart + i, text)}
              >
                {showDivider && <OrnamentalDivider />}
                <p
                  className={`mb-6 select-none ${level.blur} ${level.opacity}`}
                >
                  {text}
                </p>
              </div>
            );
          })}
          {veilSlot}
        </div>
      )}
    </article>
  );
}
