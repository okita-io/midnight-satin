"use client";

import { useState } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { AuthorProfile } from "@/lib/db/types";
import Link from "next/link";

export function AdminAuthorEditForm({
  author,
}: {
  author: AuthorProfile & { type: "author" };
}) {
  const [name, setName] = useState(() => author.name);
  const [biography, setBiography] = useState(() => author.biography ?? "");
  const [avatarUrl, setAvatarUrl] = useState(() => author.avatarUrl ?? "");
  const [styleTags, setStyleTags] = useState(() =>
    author.styleTags.join(", ")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
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
    setLoading(false);
    if (result.success) {
      window.location.href = "/admin/authors";
    } else {
      setError(result.error ?? "Failed to update");
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
