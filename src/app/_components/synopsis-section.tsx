"use client";

import React, { useState } from "react";

interface SynopsisSectionProps {
  synopsis: string | null;
}

const VISIBLE_LINES = 3;

export function SynopsisSection({ synopsis }: SynopsisSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!synopsis || !synopsis.trim()) return null;

  const needsExpand = synopsis.split("\n").length > VISIBLE_LINES || synopsis.length > 200;
  const displayText = expanded || !needsExpand
    ? synopsis
    : synopsis.slice(0, 200) + (synopsis.length > 200 ? "…" : "");

  return (
    <div className="mb-8 xs:mb-10 relative">
      <p
        className={`text-text-main/90 text-base xs:text-lg leading-relaxed font-light ${
          !expanded && needsExpand ? "line-clamp-3" : ""
        }`}
      >
        {displayText}
      </p>
      {needsExpand && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-primary text-sm uppercase tracking-widest font-bold flex items-center gap-1 hover:text-primary/80 transition-colors"
        >
          {expanded ? "Read Less" : "Read More"}{" "}
          <span
            className="material-symbols-outlined text-[16px] transition-transform"
            style={{ transform: expanded ? "rotate(180deg)" : undefined }}
          >
            expand_more
          </span>
        </button>
      )}
    </div>
  );
}
