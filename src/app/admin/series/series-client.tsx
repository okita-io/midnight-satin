"use client";

import { useState } from "react";
import { createSeriesAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export function AdminSeriesClient() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [description, setDescription] = useState("");
  const [genreTags, setGenreTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const tags = genreTags.split(",").map((t) => t.trim()).filter(Boolean);
    const result = await createSeriesAction({
      title: title.trim(),
      author_id: authorId.trim(),
      description: description.trim() || undefined,
      genre_tags: tags.length ? tags : undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setTitle("");
      setAuthorId("");
      setDescription("");
      setGenreTags("");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to create series");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 transition-opacity"
      >
        Create Series
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-void/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-series-title"
        >
          <div className="bg-surface border border-primary/40 rounded-sm max-w-md w-full p-6 shadow-gold-glow">
            <h2 id="create-series-title" className="font-display italic text-xl text-primary mb-4">
              Create Series
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="series-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
                <input id="series-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="series-author" className="block font-ui text-sm text-text-muted mb-1">Author ID *</label>
                <input id="series-author" type="text" value={authorId} onChange={(e) => setAuthorId(e.target.value)} required placeholder="UUID from Authors" className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main font-mono" />
              </div>
              <div>
                <label htmlFor="series-desc" className="block font-ui text-sm text-text-muted mb-1">Description</label>
                <textarea id="series-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="series-tags" className="block font-ui text-sm text-text-muted mb-1">Genre tags (comma-separated)</label>
                <input id="series-tags" type="text" value={genreTags} onChange={(e) => setGenreTags(e.target.value)} placeholder="romance, historical" className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
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
