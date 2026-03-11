"use client";

import React, { useState } from "react";

interface SynopsisSectionProps {
  synopsis: string | null;
  /** When true, renders the "Synopsis" section heading (used in tablet two-column layout). */
  showHeading?: boolean;
}

const VISIBLE_LINES = 3;

export function SynopsisSection({ synopsis, showHeading = false }: SynopsisSectionProps) {
  const [expanded, setExpanded] = useState(false);

  if (!synopsis || !synopsis.trim()) return null;

  const needsExpand = synopsis.split("\n").length > VISIBLE_LINES || synopsis.length > 200;
  const displayText = expanded || !needsExpand
    ? synopsis
    : synopsis.slice(0, 200) + (synopsis.length > 200 ? "…" : "");

  return (
    <section className="relative">
      {showHeading && (
        <h3 className="text-text-muted text-sm uppercase tracking-[0.2em] font-medium border-b border-primary/20 pb-2 mb-4">
          Synopsis
        </h3>
      )}
      <p
        className={`text-text-main/90 text-base leading-relaxed font-light ${
          !expanded && needsExpand && !showHeading ? "line-clamp-3" : ""
        }`}
      >
        {showHeading ? synopsis : displayText}
      </p>
      {!showHeading && needsExpand && (
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
    </section>
  );
}
