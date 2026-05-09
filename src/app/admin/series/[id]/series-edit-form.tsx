"use client";

import { useState } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Series } from "@/lib/db/types";
import Link from "next/link";

export function AdminSeriesEditForm({
  series,
}: {
  series: Series & { type: "series" };
}) {
  const [title, setTitle] = useState(() => series.title);
  const [description, setDescription] = useState(() => series.description ?? "");
  const [genreTags, setGenreTags] = useState(() => series.genreTags.join(", "));
  const [isComplete, setIsComplete] = useState(() => series.isComplete);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const tags = genreTags.split(",").flatMap((t) => {
      const x = t.trim();
      return x ? [x] : [];
    });
    const result = await updateContentAction({
      type: "series",
      id: series.id,
      updates: { title: title.trim(), description: description.trim() || null, genre_tags: tags, is_complete: isComplete },
    });
    setLoading(false);
    if (result.success) window.location.href = "/admin/series";
    else setError(result.error ?? "Failed to update");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="series-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
        <input id="series-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="series-desc" className="block font-ui text-sm text-text-muted mb-1">Description</label>
        <textarea id="series-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="series-tags" className="block font-ui text-sm text-text-muted mb-1">Genre tags</label>
        <input id="series-tags" type="text" value={genreTags} onChange={(e) => setGenreTags(e.target.value)} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div className="flex items-center gap-2">
        <input id="series-complete" type="checkbox" checked={isComplete} onChange={(e) => setIsComplete(e.target.checked)} className="rounded border-primary/40" />
        <label htmlFor="series-complete" className="font-ui text-sm">Series complete</label>
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <div className="flex gap-2">
        <Link href="/admin/series" className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</Link>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
