"use client";

import { useReducer } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { AuthorProfile } from "@/lib/db/types";
import Link from "next/link";

type AuthorEditState = {
  name: string;
  biography: string;
  avatarUrl: string;
  styleTags: string;
  loading: boolean;
  error: string | null;
};

type AuthorEditAction =
  | {
      type: "patch";
      patch: Partial<
        Pick<AuthorEditState, "name" | "biography" | "avatarUrl" | "styleTags">
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null };

function authorEditReducer(
  state: AuthorEditState,
  action: AuthorEditAction
): AuthorEditState {
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

function initialAuthorEditState(
  author: AuthorProfile & { type: "author" }
): AuthorEditState {
  return {
    name: author.name,
    biography: author.biography ?? "",
    avatarUrl: author.avatarUrl ?? "",
    styleTags: author.styleTags.join(", "),
    loading: false,
    error: null,
  };
}

export function AdminAuthorEditForm({
  author,
}: {
  author: AuthorProfile & { type: "author" };
}) {
  const [state, dispatch] = useReducer(
    authorEditReducer,
    author,
    initialAuthorEditState
  );

  const { name, biography, avatarUrl, styleTags, loading, error } = state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
    const tags = styleTags.split(",").flatMap((t) => {
      const x = t.trim();
      return x ? [x] : [];
    });
    const result = await updateContentAction({
      type: "authors",
      id: author.id,
      updates: {
        name: name.trim(),
        biography: biography.trim() || null,
        avatar_url: avatarUrl.trim() || null,
        style_tags: tags,
      },
    });
    if (result.success) {
      window.location.href = "/admin/authors";
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to update" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="author-name" className="block font-ui text-sm text-text-muted mb-1">
          Name *
        </label>
        <input
          id="author-name"
          type="text"
          value={name}
          onChange={(e) => dispatch({ type: "patch", patch: { name: e.target.value } })}
          required
          className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main"
        />
      </div>
      <div>
        <label htmlFor="author-bio" className="block font-ui text-sm text-text-muted mb-1">
          Biography
        </label>
        <textarea
          id="author-bio"
          value={biography}
          onChange={(e) =>
            dispatch({ type: "patch", patch: { biography: e.target.value } })
          }
          rows={3}
          className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main"
        />
      </div>
      <div>
        <label htmlFor="author-avatar" className="block font-ui text-sm text-text-muted mb-1">
          Avatar URL
        </label>
        <input
          id="author-avatar"
          type="url"
          value={avatarUrl}
          onChange={(e) =>
            dispatch({ type: "patch", patch: { avatarUrl: e.target.value } })
          }
          className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main"
        />
      </div>
      <div>
        <label htmlFor="author-tags" className="block font-ui text-sm text-text-muted mb-1">
          Style tags (comma-separated)
        </label>
        <input
          id="author-tags"
          type="text"
          value={styleTags}
          onChange={(e) =>
            dispatch({ type: "patch", patch: { styleTags: e.target.value } })
          }
          className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main"
        />
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <div className="flex gap-2">
        <Link
          href="/admin/authors"
          className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
