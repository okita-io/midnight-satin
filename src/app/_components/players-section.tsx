"use client";

import React, { useState } from "react";
import { CharacterPortrait } from "./character-portrait";
import { CastGalleryModal } from "./cast-gallery-modal";
import type { NovelCharacter } from "@/lib/content";

interface PlayersSectionProps {
  characters: NovelCharacter[];
}

export function PlayersSection({ characters }: PlayersSectionProps) {
  const [castGalleryOpen, setCastGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);

  const openCastGallery = (index: number) => {
    setInitialIndex(index);
    setCastGalleryOpen(true);
  };

  if (characters.length === 0) return null;

  return (
    <>
      <div className="mb-12">
        <div className="flex justify-between items-end mb-6">
          <h3 className="text-text-muted text-sm uppercase tracking-[0.2em] font-medium border-b border-primary/20 pb-2">
            The Players
          </h3>
          <button
            type="button"
            onClick={() => openCastGallery(0)}
            className="text-xs text-primary/70 hover:text-primary"
          >
            View All
          </button>
        </div>
        <div className="flex overflow-x-auto gap-6 pb-4 snap-x no-scrollbar">
          {characters.map((char, i) => (
            <CharacterPortrait
              key={char.id}
              name={char.name}
              portraitUrl={char.portraitUrl}
              onClick={() => openCastGallery(i)}
              asButton
            />
          ))}
        </div>
      </div>

      {castGalleryOpen && (
        <CastGalleryModal
          key={initialIndex}
          characters={characters}
          initialIndex={initialIndex}
          onClose={() => setCastGalleryOpen(false)}
        />
      )}
    </>
  );
}
