/**
 * Chapter content with drop cap, paragraphs, ornamental dividers (Req 3.1-3.3).
 * Supports progressive blur for The Veil paywall (Req 4.1): 1px, 3px, 6px blur levels.
 */

import { OrnamentalDivider } from "./ornamental-divider";

const ORNAMENTAL_EVERY_N_PARAGRAPHS = 4;
/** Free preview paragraphs before the Veil (Req 4.1). */
const FREE_PREVIEW_PARAGRAPHS = 5;
/** Blur levels: 1px/60%, 3px/40%, 6px/20% per design reference. */
const BLUR_LEVELS: { blur: string; opacity: string }[] = [
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
  const paragraphs = content
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    return (
      <article className="w-full max-w-none md:max-w-[680px] lg:max-w-[720px] mx-auto px-6 md:px-12 lg:px-16 text-text-main/90 font-body text-justify">
        <p className="text-text-muted italic">No content yet.</p>
      </article>
    );
  }

  const freeEnd = veilMode
    ? Math.min(FREE_PREVIEW_PARAGRAPHS, paragraphs.length)
    : paragraphs.length;
  const blurredStart = freeEnd;
  const blurredCount = paragraphs.length - blurredStart;

  return (
    <article
      className="w-full max-w-none md:max-w-[680px] lg:max-w-[720px] mx-auto px-6 md:px-12 lg:px-16 text-text-main/90 font-body text-justify"
      style={{
        fontSize: `${fontSize}px`,
        lineHeight,
      }}
    >
      {/* Chapter title block */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-4 mb-4 opacity-50">
          <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-primary" />
          <span className="w-2 h-2 rotate-45 border border-primary bg-void" />
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
          <div key={i}>
            {showDivider && <OrnamentalDivider />}
            <p className={isFirst ? "drop-cap mb-6" : "mb-6"}>{text}</p>
          </div>
        );
      })}

      {/* Progressively blurred content + Veil overlay (Req 4.1) */}
      {veilMode && blurredCount > 0 && (
        <div className="relative">
          {paragraphs.slice(blurredStart).map((text, i) => {
            const level =
              BLUR_LEVELS[Math.min(i, BLUR_LEVELS.length - 1)];
            const showDivider =
              (blurredStart + i) > 0 &&
              (blurredStart + i) % ORNAMENTAL_EVERY_N_PARAGRAPHS === 0;
            return (
              <div key={blurredStart + i}>
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
