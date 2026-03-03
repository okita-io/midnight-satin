"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { novelDetailPath, authorStudyPath } from "@/lib/navigation";

export interface SearchNovelHit {
  id: string;
  title: string;
  authorName: string;
}

export interface SearchAuthorHit {
  id: string;
  name: string;
}

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  /** Novels matching query (by title) */
  novels: SearchNovelHit[];
  /** Authors matching query (by name) */
  authors: SearchAuthorHit[];
  /** Current query (controlled) */
  query: string;
  /** Called when user types in search input */
  onQueryChange: (query: string) => void;
  /** Whether search is in progress */
  loading?: boolean;
}

/**
 * Full-screen search overlay: novels by title, authors by name.
 * Focus trap and aria-labels for accessibility.
 */
export function SearchOverlay({
  isOpen,
  onClose,
  novels,
  authors,
  query,
  onQueryChange,
  loading = false,
}: SearchOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = overlayRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0] as HTMLElement;
      const last = focusable[focusable.length - 1] as HTMLElement;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Search novels and authors"
      className="fixed inset-0 z-[100] flex flex-col bg-void"
      style={{
        paddingTop: "env(safe-area-inset-top, 0px)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 gap-4">
        <h2 className="font-header text-sm tracking-[0.15em] text-primary uppercase shrink-0">
          Search
        </h2>
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Novels, authors…"
          className="flex-1 min-w-0 px-3 py-2 rounded-sm bg-surface-highlight border border-white/10 text-text-main font-ui text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label="Search novels by title or authors by name"
          autoComplete="off"
        />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="p-2 text-text-muted hover:text-text-main focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          aria-label="Close search"
        >
          <span className="material-symbols-outlined" aria-hidden>close</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <p className="font-ui text-sm text-text-muted">Searching…</p>
        ) : query.trim() === "" ? (
          <p className="font-ui text-sm text-text-muted">
            Search novels by title or authors by name.
          </p>
        ) : (
          <>
            {novels.length > 0 && (
              <section className="mb-6" aria-label="Novels">
                <h3 className="font-header text-xs tracking-wider text-text-muted uppercase mb-3">
                  Novels
                </h3>
                <ul className="space-y-2">
                  {novels.map((n) => (
                    <li key={n.id}>
                      <Link
                        href={novelDetailPath(n.id)}
                        onClick={onClose}
                        className="block py-2 px-2 -mx-2 rounded-sm hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="font-display italic font-medium text-text-main">
                          {n.title}
                        </span>
                        <span className="font-ui text-xs text-text-muted block">
                          {n.authorName}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {authors.length > 0 && (
              <section aria-label="Authors">
                <h3 className="font-header text-xs tracking-wider text-text-muted uppercase mb-3">
                  Authors
                </h3>
                <ul className="space-y-2">
                  {authors.map((a) => (
                    <li key={a.id}>
                      <Link
                        href={authorStudyPath(a.id)}
                        onClick={onClose}
                        className="block py-2 px-2 -mx-2 rounded-sm hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <span className="font-ui text-text-main">{a.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {!loading && query.trim() !== "" && novels.length === 0 && authors.length === 0 && (
              <p className="font-ui text-sm text-text-muted">No results found.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
