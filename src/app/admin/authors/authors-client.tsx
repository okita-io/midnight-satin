"use client";

import { useReducer } from "react";
import { createAuthorAction } from "@/app/actions/admin";
import {
  authorsCreateReducer,
  initialAuthorsCreateState,
} from "@/app/admin/admin-create-modals-reducers";

export function AdminAuthorsClient() {
  const [state, dispatch] = useReducer(
    authorsCreateReducer,
    initialAuthorsCreateState
  );

  const { open, name, biography, avatarUrl, styleTags, loading, error } =
    state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
    const tags = styleTags.split(",").flatMap((t) => {
      const x = t.trim();
      return x ? [x] : [];
    });
    const result = await createAuthorAction({
      name: name.trim(),
      biography: biography.trim() || undefined,
      avatar_url: avatarUrl.trim() || undefined,
      style_tags: tags.length ? tags : undefined,
    });
    if (result.success) {
      dispatch({ type: "success_reset" });
      window.location.reload();
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to create author" });
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
        Create Author
      </button>
      {open && (
        <div
          className="fixed inset-0 bg-void/80 flex items-center justify-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-author-title"
        >
          <div className="bg-surface border border-primary/40 rounded-sm max-w-md w-full p-6 shadow-gold-glow">
            <h2 id="create-author-title" className="font-display italic text-xl text-primary mb-4">
              Create Author
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="author-name" className="block font-ui text-sm text-text-muted mb-1">
                  Name *
                </label>
                <input
                  id="author-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    dispatch({ type: "patch", patch: { name: e.target.value } })
                  }
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
                  placeholder="romance, historical, spicy"
                  className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main"
                />
              </div>
              {error && (
                <p className="text-accent text-sm">{error}</p>
              )}
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => dispatch({ type: "close" })}
                  className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Creating…" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
