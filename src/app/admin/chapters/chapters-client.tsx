"use client";

import { useReducer } from "react";
import { createChapterAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import {
  chaptersCreateReducer,
  initialChaptersCreateState,
} from "@/app/admin/admin-create-modals-reducers";

export function AdminChaptersClient() {
  const [state, dispatch] = useReducer(
    chaptersCreateReducer,
    initialChaptersCreateState
  );
  const { refresh } = useRouter();

  const {
    open,
    novelId,
    chapterNumber,
    title,
    content,
    isFree,
    loading,
    error,
  } = state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
    const num = parseInt(chapterNumber, 10);
    if (isNaN(num) || num < 1) {
      dispatch({ type: "set_error", error: "Chapter number must be >= 1" });
      dispatch({ type: "submit_end" });
      return;
    }
    const result = await createChapterAction({
      novel_id: novelId.trim(),
      chapter_number: num,
      title: title.trim(),
      content: content.trim(),
      is_free: isFree,
    });
    if (result.success) {
      dispatch({ type: "success_reset" });
      refresh();
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to create chapter" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dispatch({ type: "open" })}
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
                <input id="chapter-novel" type="text" value={novelId} onChange={(e) => dispatch({ type: "patch", patch: { novelId: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main font-mono" />
              </div>
              <div>
                <label htmlFor="chapter-num" className="block font-ui text-sm text-text-muted mb-1">Chapter Number *</label>
                <input id="chapter-num" type="number" min={1} value={chapterNumber} onChange={(e) => dispatch({ type: "patch", patch: { chapterNumber: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="chapter-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
                <input id="chapter-title" type="text" value={title} onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="chapter-content" className="block font-ui text-sm text-text-muted mb-1">Content *</label>
                <textarea id="chapter-content" value={content} onChange={(e) => dispatch({ type: "patch", patch: { content: e.target.value } })} required rows={6} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div className="flex items-center gap-2">
                <input id="chapter-free" type="checkbox" checked={isFree} onChange={(e) => dispatch({ type: "patch", patch: { isFree: e.target.checked } })} className="rounded border-primary/40" />
                <label htmlFor="chapter-free" className="font-ui text-sm">Free to read</label>
              </div>
              {error && <p className="text-accent text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => dispatch({ type: "close" })} className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
