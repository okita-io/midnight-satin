"use client";

import Link from "next/link";
import type { BibliographyGroup } from "@/lib/content";

interface BibliographySectionProps {
  groups: BibliographyGroup[];
}

function formatYear(date: Date | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.getFullYear().toString();
}

/** Novels grouped by Series with cover (80x112px), title, synopsis excerpt, rating, year (Req 7.5). */
export function BibliographySection({ groups }: BibliographySectionProps) {
  if (groups.length === 0) return null;

  return (
    <div className="px-4 xs:px-6 space-y-8">
      {groups.map((group) => (
        <section key={group.seriesId ?? "standalone"}>
          <div className="flex items-end justify-between mb-4 border-b border-[#393528] pb-2">
            <h3 className="font-header text-primary text-sm tracking-[0.15em] uppercase">
              {group.seriesTitle}
            </h3>
            <span className="text-[10px] text-text-muted italic font-display">
              {group.isComplete ? "Completed" : `${group.novels.length} Title${group.novels.length !== 1 ? "s" : ""}`}
            </span>
          </div>
          <div className="flex flex-col gap-4">
            {group.novels.map((novel, idx) => (
              <Link
                key={novel.id}
                href={`/novel/${novel.id}`}
                className="flex gap-3 xs:gap-4 group cursor-pointer"
              >
                <div className="relative w-20 h-28 shrink-0 rounded-sm overflow-hidden shadow-lg border border-[#393528] group-hover:border-primary transition-colors">
                  {novel.coverImageUrl ? (
                    <img
                      src={novel.coverImageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary/50 text-3xl">
                        menu_book
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col justify-center flex-1 border-b border-[#393528]/30 pb-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-text-main font-display text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                      {novel.title}
                    </h4>
                  </div>
                  <p className="text-text-muted text-sm line-clamp-2 mb-3">
                    {novel.synopsis || "No synopsis available."}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-primary text-xs">
                      <span className="material-symbols-outlined text-[14px]">star</span>
                      <span>{novel.rating > 0 ? novel.rating.toFixed(1) : "—"}</span>
                    </div>
                    <span className="text-text-muted text-[10px] uppercase tracking-wider">
                      {group.seriesId && group.novels.length > 1
                        ? `Book ${idx + 1} • `
                        : ""}
                      {formatYear(novel.publicationDate)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ))}
      <div className="flex justify-center pt-4 pb-8">
        <p className="font-script text-2xl text-text-muted opacity-50">fin</p>
      </div>
    </div>
  );
}
