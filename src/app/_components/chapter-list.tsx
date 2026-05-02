"use client";

import Link from "next/link";
import { readingRoomPath } from "@/lib/navigation";
import type { NovelChapter } from "@/lib/content";

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

interface ChapterListProps {
  novelId: string;
  chapters: NovelChapter[];
  unlockedIds: Set<string>;
  updatedAgo?: string | null;
}

export function ChapterList({
  novelId,
  chapters,
  unlockedIds,
  updatedAgo: _updatedAgo,
}: ChapterListProps) {
  const freeOnlyCount = chapters.filter((ch) => ch.isFree).length;
  const unlockedPaidCount = chapters.filter(
    (ch) => !ch.isFree && unlockedIds.has(ch.id),
  ).length;
  const lockedCount = chapters.length - freeOnlyCount - unlockedPaidCount;

  return (
    <div className="mb-24">
      <div className="flex justify-between items-end mb-6">
        <h3 className="text-text-muted text-sm uppercase tracking-[0.2em] font-medium border-b border-primary/20 pb-2">
          Contents
        </h3>
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {freeOnlyCount > 0 ? (
            <span className="text-[10px] text-primary/60 uppercase tracking-widest font-ui">
              {freeOnlyCount} Free {freeOnlyCount === 1 ? "Chapter" : "Chapters"}
            </span>
          ) : null}
          {unlockedPaidCount > 0 ? (
            <span className="text-[10px] text-primary/60 uppercase tracking-widest font-ui">
              {unlockedPaidCount} Unlocked
            </span>
          ) : null}
          <span className="text-[10px] text-primary/60 uppercase tracking-widest font-ui">
            {lockedCount} Locked
          </span>
        </div>
      </div>
      <div className="flex flex-col divide-y divide-white/5">
        {chapters.map((ch) => {
          const isAccessible = ch.isFree || unlockedIds.has(ch.id);
          const href = readingRoomPath(novelId, ch.id);

          return (
            <Link
              key={ch.id}
              href={isAccessible ? href : "#"}
              className={`group flex items-center md:items-end justify-between py-5 px-2 -mx-2 rounded transition-colors ${isAccessible
                  ? "cursor-pointer hover:bg-white/5 active:scale-[0.99]"
                  : "cursor-default opacity-60"
                }`}
              onClick={(e) => !isAccessible && e.preventDefault()}
            >
              <div className="flex flex-col gap-1">
                <span
                  className={`text-xs uppercase tracking-widest font-bold ${isAccessible ? "text-primary" : "text-text-muted"
                    }`}
                >
                  Chapter {toRoman(ch.chapterNumber)}
                </span>
                <span
                  className={`text-lg font-display italic ${isAccessible ? "text-text-main" : "text-text-muted"
                    }`}
                >
                  {ch.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isAccessible ? (
                  <>
                    <span className="text-xs text-text-muted">
                      {ch.isFree ? "Free" : "Unlocked"}
                    </span>
                    <span className="material-symbols-outlined text-text-muted/50 text-xl">
                      chevron_right
                    </span>
                  </>
                ) : (
                  <span
                    className="material-symbols-outlined text-primary text-[18px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                    aria-label="Locked"
                  >
                    lock
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
