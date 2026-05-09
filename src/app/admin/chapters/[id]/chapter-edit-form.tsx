"use client";

import { useReducer } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Chapter } from "@/lib/db/types";
import Link from "next/link";

type ChapterEditState = {
  title: string;
  content: string;
  isFree: boolean;
  loading: boolean;
  error: string | null;
};

type ChapterEditAction =
  | {
      type: "patch";
      patch: Partial<Pick<ChapterEditState, "title" | "content" | "isFree">>;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null };

function chapterEditReducer(
  state: ChapterEditState,
  action: ChapterEditAction
): ChapterEditState {
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

function initialChapterEditState(chapter: Chapter & { type: "chapter" }): ChapterEditState {
  return {
    title: chapter.title,
    content: chapter.content,
    isFree: chapter.isFree,
    loading: false,
    error: null,
  };
}

export function AdminChapterEditForm({
  chapter,
}: {
  chapter: Chapter & { type: "chapter" };
}) {
  const [state, dispatch] = useReducer(
    chapterEditReducer,
    chapter,
    initialChapterEditState
  );

  const { title, content, isFree, loading, error } = state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
    const result = await updateContentAction({
      type: "chapters",
      id: chapter.id,
      updates: { title: title.trim(), content: content.trim(), is_free: isFree },
    });
    if (result.success) {
      window.location.href = "/admin/chapters";
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to update" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="chapter-title" className="block font-ui text-sm text-text-muted mb-1">Title *</label>
        <input id="chapter-title" type="text" value={title} onChange={(e) => dispatch({ type: "patch", patch: { title: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="chapter-content" className="block font-ui text-sm text-text-muted mb-1">Content *</label>
        <textarea id="chapter-content" value={content} onChange={(e) => dispatch({ type: "patch", patch: { content: e.target.value } })} required rows={12} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div className="flex items-center gap-2">
        <input id="chapter-free" type="checkbox" checked={isFree} onChange={(e) => dispatch({ type: "patch", patch: { isFree: e.target.checked } })} className="rounded border-primary/40" />
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
