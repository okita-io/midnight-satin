"use client";

import { useState } from "react";
import { createCharacterAction } from "@/app/actions/admin";
import { useRouter } from "next/navigation";

export function AdminCharactersClient() {
  const [open, setOpen] = useState(false);
  const [novelId, setNovelId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [portraitUrl, setPortraitUrl] = useState("");
  const [description, setDescription] = useState("");
  const [backstory, setBackstory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await createCharacterAction({
      novel_id: novelId.trim(),
      name: name.trim(),
      role: role.trim() || undefined,
      portrait_url: portraitUrl.trim() || undefined,
      description: description.trim() || undefined,
      backstory: backstory.trim() || undefined,
    });
    setLoading(false);
    if (result.success) {
      setOpen(false);
      setNovelId("");
      setName("");
      setRole("");
      setPortraitUrl("");
      setDescription("");
      setBackstory("");
      router.refresh();
    } else {
      setError(result.error ?? "Failed to create character");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 transition-opacity"
      >
        Create Character
      </button>
      {open && (
        <div className="fixed inset-0 bg-void/80 flex items-center justify-center z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="create-character-title">
          <div className="bg-surface border border-primary/40 rounded-sm max-w-md w-full p-6 shadow-gold-glow my-8">
            <h2 id="create-character-title" className="font-display italic text-xl text-primary mb-4">Create Character</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="char-novel" className="block font-ui text-sm text-text-muted mb-1">Novel ID *</label>
                <input id="char-novel" type="text" value={novelId} onChange={(e) => setNovelId(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main font-mono" />
              </div>
              <div>
                <label htmlFor="char-name" className="block font-ui text-sm text-text-muted mb-1">Name *</label>
                <input id="char-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              <div>
                <label htmlFor="char-role" className="block font-ui text-sm text-text-muted mb-1">Role subtitle</label>
                <input id="char-role" type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="The Exiled Heir" className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
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
                <textarea id="char-backstory" value={backstory} onChange={(e) => setBackstory(e.target.value)} rows={3} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
              </div>
              {error && <p className="text-accent text-sm">{error}</p>}
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Creating…" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
