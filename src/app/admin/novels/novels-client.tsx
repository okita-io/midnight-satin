"use client";

import { useReducer } from "react";
import { createNovelAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";
import {
  initialNovelsCreateState,
  novelsCreateReducer,
} from "@/app/admin/admin-create-modals-reducers";

export function AdminNovelsClient() {
  const [state, dispatch] = useReducer(novelsCreateReducer, initialNovelsCreateState);
  const { refresh } = useRouter();

  const {
    open,
    title,
    authorId,
    seriesId,
    coverImageUrl,
    synopsis,
    genreTags,
    loading,
    error,
  } = state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
    const tags = genreTags.split(",").flatMap((t) => {
      const x = t.trim();
      return x ? [x] : [];
    });
    const result = await createNovelAction({
      title: title.trim(),
      author_id: authorId.trim(),
      series_id: seriesId.trim() || undefined,
      cover_image_url: coverImageUrl.trim() || undefined,
      synopsis: synopsis.trim() || undefined,
      genre_tags: tags.length ? tags : undefined,
    });
    if (result.success) {
      dispatch({ type: "success_reset" });
      refresh();
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to create novel" });
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
        Create Novel
      </button>
      {open && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="create-novel-title">
          <div className="bg-surface border border-primary/40 rounded-sm max-w-md w-full p-6 shadow-gold-glow my-8">
            <h2 id="create-novel-title" className="font-display italic text-xl text-primary mb-4">Create Novel</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="novel-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
                <input id="novel-title" type="text" value={title} onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="novel-author" className="block font-ui text-sm text-text-muted mb-1">Author ID *</label>
                <input id="novel-author" type="text" value={authorId} onChange={(e) => dispatch({ type: "patch", patch: { authorId: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main font-mono" />
              </div>
              <div>
                <label htmlFor="novel-series" className="block font-ui text-sm text-text-muted mb-1">Series ID (optional)</label>
                <input id="novel-series" type="text" value={seriesId} onChange={(e) => dispatch({ type: "patch", patch: { seriesId: e.target.value } })} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main font-mono" />
              </div>
              <div>
                <label htmlFor="novel-cover" className="block font-ui text-sm text-text-muted mb-1">Cover URL</label>
                <input id="novel-cover" type="url" value={coverImageUrl} onChange={(e) => dispatch({ type: "patch", patch: { coverImageUrl: e.target.value } })} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="novel-synopsis" className="block font-ui text-sm text-text-muted mb-1">Synopsis</label>
                <textarea id="novel-synopsis" value={synopsis} onChange={(e) => dispatch({ type: "patch", patch: { synopsis: e.target.value } })} rows={3} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="novel-tags" className="block font-ui text-sm text-text-muted mb-1">Genre tags (comma-separated)</label>
                <input id="novel-tags" type="text" value={genreTags} onChange={(e) => dispatch({ type: "patch", patch: { genreTags: e.target.value } })} placeholder="romance, historical" className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
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
