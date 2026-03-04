"use client";

import { useState } from "react";
import { createAuthorAction } from "@/app/actions/admin";

export function AdminAuthorsClient() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [biography, setBiography] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [styleTags, setStyleTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const tags = styleTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const result = await createAuthorAction({
      name: name.trim(),
      biography: biography.trim() || undefined,
      avatar_url: avatarUrl.trim() || undefined,
      style_tags: tags.length ? tags : undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setName("");
      setBiography("");
      setAvatarUrl("");
      setStyleTags("");
      window.location.reload();
    } else {
      setError(result.error ?? "Failed to create author");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
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
                  onChange={(e) => setName(e.target.value)}
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
                  onChange={(e) => setBiography(e.target.value)}
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
                  onChange={(e) => setAvatarUrl(e.target.value)}
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
                  onChange={(e) => setStyleTags(e.target.value)}
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
                  onClick={() => setOpen(false)}
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
