"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CharacterPortrait } from "./character-portrait";
import { CastGalleryModal } from "./cast-gallery-modal";
import { AuthPrompt } from "./auth-prompt";
import { endorseCharacter } from "@/app/actions/endorse-character";
import type { NovelCharacter } from "@/lib/content";

interface PlayersSectionProps {
  characters: NovelCharacter[];
  novelId: string;
  isAuthenticated: boolean;
}

export function PlayersSection({
  characters,
  novelId,
  isAuthenticated,
}: PlayersSectionProps) {
  const router = useRouter();
  const [castGalleryOpen, setCastGalleryOpen] = useState(false);
  const [initialIndex, setInitialIndex] = useState(0);
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const openCastGallery = (index: number) => {
    setInitialIndex(index);
    setCastGalleryOpen(true);
  };

  const handleEndorse = useCallback(
    async (characterId: string) => {
      const result = await endorseCharacter(characterId);
      if (result.success) {
        setToast("-1 Credit");
        setTimeout(() => setToast(null), 2000);
        router.refresh();
      } else {
        setToast(result.error);
        setTimeout(() => setToast(null), 3000);
      }
    },
    [router]
  );

  if (characters.length === 0) return null;

  return (
    <>
      <div className="mb-10 xs:mb-12">
        <div className="flex justify-between items-end mb-4 xs:mb-6">
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
        <div className="flex overflow-x-auto gap-4 xs:gap-6 pb-4 snap-x no-scrollbar">
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
          onEndorse={isAuthenticated ? handleEndorse : undefined}
          onAuthPrompt={!isAuthenticated ? () => setAuthPromptOpen(true) : undefined}
        />
      )}

      <AuthPrompt
        isOpen={authPromptOpen}
        onClose={() => setAuthPromptOpen(false)}
        returnUrl={`/novel/${novelId}`}
        message="Send a rose to endorse your favorite character."
      />

      {toast && (
        <div
          className="fixed top-[calc(1rem+env(safe-area-inset-top,0px))] left-1/2 -translate-x-1/2 z-[110] px-4 py-2 rounded border border-primary/30 bg-surface text-primary font-ui text-sm shadow-gold-glow"
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </>
  );
}
