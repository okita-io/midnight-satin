"use client";

import { useState } from "react";
import { createChapterAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export function AdminChaptersClient() {
  const [open, setOpen] = useState(false);
  const [novelId, setNovelId] = useState("");
  const [chapterNumber, setChapterNumber] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const num = parseInt(chapterNumber, 10);
    if (isNaN(num) || num < 1) {
      setError("Chapter number must be >= 1");
      setLoading(false);
      return;
    }
    const result = await createChapterAction({
      novel_id: novelId.trim(),
      chapter_number: num,
      title: title.trim(),
      content: content.trim(),
      is_free: isFree,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setNovelId("");
      setChapterNumber("");
      setTitle("");
      setContent("");
      setIsFree(false);
      router.refresh();
    } else {
      setError(result.error ?? "Failed to create chapter");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 transition-opacity"
      >
        Create Chapter
      </button>
      {open && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="create-chapter-title">
          <div className="bg-surface border border-primary/40 rounded-sm max-w-md w-full p-6 shadow-gold-glow my-8">
            <h2 id="create-chapter-title" className="font-display italic text-xl text-primary mb-4">Create Chapter</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="chapter-novel" className="block font-ui text-sm text-text-muted mb-1">Novel ID *</label>
                <input id="chapter-novel" type="text" value={novelId} onChange={(e) => setNovelId(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main font-mono" />
              </div>
              <div>
                <label htmlFor="chapter-num" className="block font-ui text-sm text-text-muted mb-1">Chapter Number *</label>
                <input id="chapter-num" type="number" min={1} value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="chapter-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
                <input id="chapter-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="chapter-content" className="block font-ui text-sm text-text-muted mb-1">Content *</label>
                <textarea id="chapter-content" value={content} onChange={(e) => setContent(e.target.value)} required rows={6} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div className="flex items-center gap-2">
                <input id="chapter-free" type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="rounded border-primary/40" />
                <label htmlFor="chapter-free" className="font-ui text-sm">Free to read</label>
              </div>
              {error && <p className="text-accent text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
