"use client";

import type { ReaderProfileStats } from "@/app/actions/profile";

interface ReadingStatsRowProps {
  stats: ReaderProfileStats;
}

/**
 * ReadingStatsRow: Horizontal pills for chapters read, hours read, roses sent, authors followed.
 * Req 18.3.
 */
export function ReadingStatsRow({ stats }: ReadingStatsRowProps) {
  const pills = [
    {
      label: "Chapters",
      value: stats.chaptersRead,
      icon: "menu_book",
    },
    {
      label: "Hours",
      value: stats.hoursReadEstimate,
      icon: "schedule",
    },
    {
      label: "Roses",
      value: stats.rosesSent,
      icon: "local_florist",
    },
    {
      label: "Authors",
      value: stats.authorsFollowed,
      icon: "person",
    },
  ];

  return (
    <div className="flex overflow-x-auto gap-2 xs:gap-3 px-4 xs:px-6 pb-6 no-scrollbar">
      {pills.map(({ label, value, icon }) => (
        <div
          key={label}
          className="shrink-0 flex items-center gap-1.5 xs:gap-2 px-3 xs:px-4 py-2 rounded-sm bg-surface border border-white/5"
        >
          <span
            className="material-symbols-outlined text-primary text-lg"
            aria-hidden
          >
            {icon}
          </span>
          <div>
            <span className="font-display font-bold italic text-lg text-text-main block">
              {value.toLocaleString()}
            </span>
            <span className="font-ui text-[10px] text-text-muted uppercase tracking-wider">
              {label}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
