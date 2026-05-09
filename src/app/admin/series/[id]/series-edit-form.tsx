"use client";

import { useReducer } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Series } from "@/lib/db/types";
import Link from "next/link";

type SeriesEditState = {
  title: string;
  description: string;
  genreTags: string;
  isComplete: boolean;
  loading: boolean;
  error: string | null;
};

type SeriesEditAction =
  | {
      type: "patch";
      patch: Partial<
        Pick<SeriesEditState, "title" | "description" | "genreTags" | "isComplete">
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null };

function seriesEditReducer(
  state: SeriesEditState,
  action: SeriesEditAction
): SeriesEditState {
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

function initialSeriesEditState(series: Series & { type: "series" }): SeriesEditState {
  return {
    title: series.title,
    description: series.description ?? "",
    genreTags: series.genreTags.join(", "),
    isComplete: series.isComplete,
    loading: false,
    error: null,
  };
}

export function AdminSeriesEditForm({
  series,
}: {
  series: Series & { type: "series" };
}) {
  const [state, dispatch] = useReducer(seriesEditReducer, series, initialSeriesEditState);

  const { title, description, genreTags, isComplete, loading, error } = state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
    const tags = genreTags.split(",").flatMap((t) => {
      const x = t.trim();
      return x ? [x] : [];
    });
    const result = await updateContentAction({
      type: "series",
      id: series.id,
      updates: {
        title: title.trim(),
        description: description.trim() || null,
        genre_tags: tags,
        is_complete: isComplete,
      },
    });
    if (result.success) {
      window.location.href = "/admin/series";
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to update" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="series-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
        <input id="series-title" type="text" value={title} onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="series-desc" className="block font-ui text-sm text-text-muted mb-1">Description</label>
        <textarea id="series-desc" value={description} onChange={(e) => dispatch({ type: "patch", patch: { description: e.target.value } })} rows={2} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="series-tags" className="block font-ui text-sm text-text-muted mb-1">Genre tags</label>
        <input id="series-tags" type="text" value={genreTags} onChange={(e) => dispatch({ type: "patch", patch: { genreTags: e.target.value } })} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div className="flex items-center gap-2">
        <input id="series-complete" type="checkbox" checked={isComplete} onChange={(e) => dispatch({ type: "patch", patch: { isComplete: e.target.checked } })} className="rounded border-primary/40" />
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
