"use client";

import { useReducer } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Novel } from "@/lib/db/types";
import Link from "next/link";

type NovelEditState = {
  title: string;
  coverImageUrl: string;
  synopsis: string;
  genreTags: string;
  isFeatured: boolean;
  featuredOrder: string;
  loading: boolean;
  error: string | null;
};

type NovelEditAction =
  | {
      type: "patch";
      patch: Partial<
        Pick<
          NovelEditState,
          | "title"
          | "coverImageUrl"
          | "synopsis"
          | "genreTags"
          | "isFeatured"
          | "featuredOrder"
        >
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null };

function novelEditReducer(
  state: NovelEditState,
  action: NovelEditAction
): NovelEditState {
  switch (action.type) {
    case "patch":
      return { ...state, ...action.patch };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    default:
      return state;
  }
}

function initialNovelEditState(novel: Novel & { type: "novel" }): NovelEditState {
  return {
    title: novel.title,
    coverImageUrl: novel.coverImageUrl ?? "",
    synopsis: novel.synopsis ?? "",
    genreTags: novel.genreTags.join(", "),
    isFeatured: novel.isFeatured ?? false,
    featuredOrder:
      novel.featuredOrder != null ? String(novel.featuredOrder) : "",
    loading: false,
    error: null,
  };
}

export function AdminNovelEditForm({
  novel,
}: {
  novel: Novel & { type: "novel" };
}) {
  const [state, dispatch] = useReducer(novelEditReducer, novel, initialNovelEditState);

  const {
    title,
    coverImageUrl,
    synopsis,
    genreTags,
    isFeatured,
    featuredOrder,
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
    if (result.success) {
      window.location.href = "/admin/novels";
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to update" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="novel-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
        <input id="novel-title" type="text" value={title} onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
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
        <label htmlFor="novel-tags" className="block font-ui text-sm text-text-muted mb-1">Genre tags</label>
        <input id="novel-tags" type="text" value={genreTags} onChange={(e) => dispatch({ type: "patch", patch: { genreTags: e.target.value } })} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div className="flex items-center gap-2">
        <input id="novel-featured" type="checkbox" checked={isFeatured} onChange={(e) => dispatch({ type: "patch", patch: { isFeatured: e.target.checked } })} className="rounded border-primary/40" />
        <label htmlFor="novel-featured" className="font-ui text-sm">Featured (hero carousel)</label>
      </div>
      {isFeatured && (
        <div>
          <label htmlFor="novel-order" className="block font-ui text-sm text-text-muted mb-1">Featured order (lower = first)</label>
          <input id="novel-order" type="number" value={featuredOrder} onChange={(e) => dispatch({ type: "patch", patch: { featuredOrder: e.target.value } })} placeholder="0" className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
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
