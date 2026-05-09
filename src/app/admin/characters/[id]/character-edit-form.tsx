"use client";

import { useState } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Character } from "@/lib/db/types";
import Link from "next/link";

export function AdminCharacterEditForm({
  character,
}: {
  character: Character & { type: "character" };
}) {
  const [name, setName] = useState(() => character.name);
  const [roleSubtitle, setRoleSubtitle] = useState(
    () => character.roleSubtitle ?? ""
  );
  const [portraitUrl, setPortraitUrl] = useState(
    () => character.portraitUrl ?? ""
  );
  const [description, setDescription] = useState(
    () => character.description ?? ""
  );
  const [backstory, setBackstory] = useState(
    () => character.backstory ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await updateContentAction({
      type: "characters",
      id: character.id,
      updates: {
        name: name.trim(),
        role_subtitle: roleSubtitle.trim() || null,
        portrait_url: portraitUrl.trim() || null,
        description: description.trim() || null,
        backstory: backstory.trim() || null,
      },
    });
    setLoading(false);
    if (result.success) window.location.href = "/admin/characters";
    else setError(result.error ?? "Failed to update");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="char-name" className="block font-ui text-sm text-text-muted mb-1">Name *</label>
        <input id="char-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-role" className="block font-ui text-sm text-text-muted mb-1">Role subtitle</label>
        <input id="char-role" type="text" value={roleSubtitle} onChange={(e) => setRoleSubtitle(e.target.value)} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-portrait" className="block font-ui text-sm text-text-muted mb-1">Portrait URL</label>
        <input id="char-portrait" type="url" value={portraitUrl} onChange={(e) => setPortraitUrl(e.target.value)} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-desc" className="block font-ui text-sm text-text-muted mb-1">Description</label>
        <textarea id="char-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-backstory" className="block font-ui text-sm text-text-muted mb-1">Backstory</label>
        <textarea id="char-backstory" value={backstory} onChange={(e) => setBackstory(e.target.value)} rows={4} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <div className="flex gap-2">
        <Link href="/admin/characters" className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</Link>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
