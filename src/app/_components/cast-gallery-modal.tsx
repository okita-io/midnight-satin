"use client";

import React, { useEffect, useCallback, useState } from "react";
import type { NovelCharacter } from "@/lib/content";

interface CastGalleryModalProps {
  characters: NovelCharacter[];
  initialIndex?: number;
  onClose: () => void;
}

/**
 * Cast Gallery modal - full-screen character viewer.
 * Opens from Novel Detail "The Players" or character portrait tap.
 * Task 10 will expand with dossier flip, endorsement FAB, etc.
 */
export function CastGalleryModal({
  characters,
  initialIndex = 0,
  onClose,
}: CastGalleryModalProps) {
  const safeIndex = Math.min(initialIndex, Math.max(0, characters.length - 1));
  const [index, setIndex] = useState(safeIndex);
  const char = characters[index];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : characters.length - 1));
  }, [characters.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < characters.length - 1 ? i + 1 : 0));
  }, [characters.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    },
    [onClose, goPrev, goNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (characters.length === 0 || !char) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center bg-void"
      role="dialog"
      aria-modal="true"
      aria-label="Cast Gallery"
    >
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-6 bg-gradient-to-b from-void/90 to-transparent">
        <span className="font-header text-primary text-xs tracking-[0.2em] uppercase">
          Cast Gallery
        </span>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center size-10 rounded-full bg-surface/50 border border-white/10 backdrop-blur-sm text-text-main hover:bg-primary hover:text-void hover:border-primary transition-all duration-300"
          aria-label="Close Cast Gallery"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
            close
          </span>
        </button>
      </div>

      {/* Main card area */}
      <main className="relative w-full flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-4 pt-20">
        {/* Nav arrows - visible on larger screens */}
        <button
          type="button"
          onClick={goPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex size-12 items-center justify-center rounded-full text-white/30 hover:text-primary transition-colors"
          aria-label="Previous character"
        >
          <span className="material-symbols-outlined text-4xl">chevron_left</span>
        </button>
        <button
          type="button"
          onClick={goNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex size-12 items-center justify-center rounded-full text-white/30 hover:text-primary transition-colors"
          aria-label="Next character"
        >
          <span className="material-symbols-outlined text-4xl">chevron_right</span>
        </button>

        {/* Character card - 75vh */}
        <div className="w-full h-[75vh] max-h-[600px] relative rounded-lg overflow-hidden border border-white/5 shadow-[0px_4px_20px_rgba(212,175,55,0.15)]">
          {/* Background portrait */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: char.portraitUrl
                ? `url(${char.portraitUrl})`
                : undefined,
              backgroundColor: char.portraitUrl ? "transparent" : "var(--surface)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void via-void/60 to-transparent" />

          {/* Trophy badge */}
          {char.hasTrophy && (
            <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1">
              <div className="size-10 rounded-full bg-surface/80 backdrop-blur border border-primary flex items-center justify-center text-primary shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  emoji_events
                </span>
              </div>
              <span className="text-[10px] font-header text-primary tracking-widest uppercase bg-void/80 px-2 py-0.5 rounded-full border border-primary/30">
                Top Pick
              </span>
            </div>
          )}

          {/* Bottom content */}
          <div className="absolute bottom-0 left-0 right-0 p-8 pt-32 bg-gradient-to-t from-void via-void/90 to-transparent flex flex-col items-center text-center">
            {char.description && (
              <p className="font-body text-sm italic text-text-main/60 leading-relaxed mb-6 max-w-[85%]">
                {char.description}
              </p>
            )}
            {char.roleSubtitle && (
              <div className="mb-2 flex items-center gap-2 opacity-80">
                <div className="h-[1px] w-8 bg-primary/50" />
                <span className="font-ui text-primary text-xs tracking-[0.2em] uppercase">
                  {char.roleSubtitle}
                </span>
                <div className="h-[1px] w-8 bg-primary/50" />
              </div>
            )}
            <h2 className="font-display text-4xl italic text-white mb-6 drop-shadow-lg">
              {char.name}
            </h2>
            <div className="flex flex-col items-center gap-1">
              <span className="font-display font-bold text-primary text-lg drop-shadow-md">
                {char.endorsementCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-text-muted uppercase tracking-widest font-ui">
                Endorsements
              </span>
            </div>
          </div>
        </div>

        {/* Mobile nav dots */}
        {characters.length > 1 && (
          <div className="flex gap-2 mt-4">
            {characters.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                className={`size-2 rounded-full transition-colors ${
                  i === index ? "bg-primary" : "bg-white/30"
                }`}
                aria-label={`Go to character ${i + 1}`}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
