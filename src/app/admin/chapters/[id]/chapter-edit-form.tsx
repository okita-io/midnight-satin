"use client";

import { useState } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Chapter } from "@/lib/db/types";
import Link from "next/link";

export function AdminChapterEditForm({
  chapter,
}: {
  chapter: Chapter & { type: "chapter" };
}) {
  const [title, setTitle] = useState(chapter.title);
  const [content, setContent] = useState(chapter.content);
  const [isFree, setIsFree] = useState(chapter.isFree);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await updateContentAction({
      type: "chapters",
      id: chapter.id,
      updates: { title: title.trim(), content: content.trim(), is_free: isFree },
    });
    setLoading(false);
    if (result.success) window.location.href = "/admin/chapters";
    else setError(result.error ?? "Failed to update");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="chapter-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
        <input id="chapter-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="chapter-content" className="block font-ui text-sm text-text-muted mb-1">Content *</label>
        <textarea id="chapter-content" value={content} onChange={(e) => setContent(e.target.value)} required rows={12} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div className="flex items-center gap-2">
        <input id="chapter-free" type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} className="rounded border-primary/40" />
        <label htmlFor="chapter-free" className="font-ui text-sm">Free to read</label>
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <div className="flex gap-2">
        <Link href="/admin/chapters" className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</Link>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
