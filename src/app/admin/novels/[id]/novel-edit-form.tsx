"use client";

import { useState } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Novel } from "@/lib/db/types";
import Link from "next/link";

export function AdminNovelEditForm({
  novel,
}: {
  novel: Novel & { type: "novel" };
}) {
  const [title, setTitle] = useState(novel.title);
  const [coverImageUrl, setCoverImageUrl] = useState(novel.coverImageUrl ?? "");
  const [synopsis, setSynopsis] = useState(novel.synopsis ?? "");
  const [genreTags, setGenreTags] = useState(novel.genreTags.join(", "));
  const [isFeatured, setIsFeatured] = useState(novel.isFeatured ?? false);
  const [featuredOrder, setFeaturedOrder] = useState(
    novel.featuredOrder != null ? String(novel.featuredOrder) : ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const tags = genreTags.split(",").map((t) => t.trim()).filter(Boolean);
    const updates: Record<string, unknown> = {
      title: title.trim(),
      cover_image_url: coverImageUrl.trim() || null,
      synopsis: synopsis.trim() || null,
      genre_tags: tags,
    };
    if (isFeatured) {
      updates.is_featured = true;
      updates.featured_order = featuredOrder ? parseInt(featuredOrder, 10) : null;
    } else {
      updates.is_featured = false;
      updates.featured_order = null;
    }
    const result = await updateContentAction({
      type: "novels",
      id: novel.id,
      updates,
    });
    setLoading(false);
    if (result.success) window.location.href = "/admin/novels";
    else setError(result.error ?? "Failed to update");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="novel-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
        <input id="novel-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="novel-cover" className="block font-ui text-sm text-text-muted mb-1">Cover URL</label>
        <input id="novel-cover" type="url" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="novel-synopsis" className="block font-ui text-sm text-text-muted mb-1">Synopsis</label>
        <textarea id="novel-synopsis" value={synopsis} onChange={(e) => setSynopsis(e.target.value)} rows={3} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="novel-tags" className="block font-ui text-sm text-text-muted mb-1">Genre tags</label>
        <input id="novel-tags" type="text" value={genreTags} onChange={(e) => setGenreTags(e.target.value)} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div className="flex items-center gap-2">
        <input id="novel-featured" type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-primary/40" />
        <label htmlFor="novel-featured" className="font-ui text-sm">Featured (hero carousel)</label>
      </div>
      {isFeatured && (
        <div>
          <label htmlFor="novel-order" className="block font-ui text-sm text-text-muted mb-1">Featured order (lower = first)</label>
          <input id="novel-order" type="number" value={featuredOrder} onChange={(e) => setFeaturedOrder(e.target.value)} placeholder="0" className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
        </div>
      )}
      {error && <p className="text-accent text-sm">{error}</p>}
      <div className="flex gap-2">
        <Link href="/admin/novels" className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</Link>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
