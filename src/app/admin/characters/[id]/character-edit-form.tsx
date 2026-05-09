"use client";

import { useReducer } from "react";
import { updateContentAction } from "@/app/actions/admin";
import type { Character } from "@/lib/db/types";
import Link from "next/link";

type CharacterEditState = {
  name: string;
  roleSubtitle: string;
  portraitUrl: string;
  description: string;
  backstory: string;
  loading: boolean;
  error: string | null;
};

type CharacterEditAction =
  | {
      type: "patch";
      patch: Partial<
        Pick<
          CharacterEditState,
          "name" | "roleSubtitle" | "portraitUrl" | "description" | "backstory"
        >
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null };

function characterEditReducer(
  state: CharacterEditState,
  action: CharacterEditAction
): CharacterEditState {
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

function initialCharacterEditState(
  character: Character & { type: "character" }
): CharacterEditState {
  return {
    name: character.name,
    roleSubtitle: character.roleSubtitle ?? "",
    portraitUrl: character.portraitUrl ?? "",
    description: character.description ?? "",
    backstory: character.backstory ?? "",
    loading: false,
    error: null,
  };
}

export function AdminCharacterEditForm({
  character,
}: {
  character: Character & { type: "character" };
}) {
  const [state, dispatch] = useReducer(
    characterEditReducer,
    character,
    initialCharacterEditState
  );

  const { name, roleSubtitle, portraitUrl, description, backstory, loading, error } =
    state;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    dispatch({ type: "submit_start" });
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
    if (result.success) {
      window.location.href = "/admin/characters";
    } else {
      dispatch({ type: "set_error", error: result.error ?? "Failed to update" });
      dispatch({ type: "submit_end" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="char-name" className="block font-ui text-sm text-text-muted mb-1">Name *</label>
        <input id="char-name" type="text" value={name} onChange={(e) => dispatch({ type: "patch", patch: { name: e.target.value } })} required className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-role" className="block font-ui text-sm text-text-muted mb-1">Role subtitle</label>
        <input id="char-role" type="text" value={roleSubtitle} onChange={(e) => dispatch({ type: "patch", patch: { roleSubtitle: e.target.value } })} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-portrait" className="block font-ui text-sm text-text-muted mb-1">Portrait URL</label>
        <input id="char-portrait" type="url" value={portraitUrl} onChange={(e) => dispatch({ type: "patch", patch: { portraitUrl: e.target.value } })} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-desc" className="block font-ui text-sm text-text-muted mb-1">Description</label>
        <textarea id="char-desc" value={description} onChange={(e) => dispatch({ type: "patch", patch: { description: e.target.value } })} rows={2} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      <div>
        <label htmlFor="char-backstory" className="block font-ui text-sm text-text-muted mb-1">Backstory</label>
        <textarea id="char-backstory" value={backstory} onChange={(e) => dispatch({ type: "patch", patch: { backstory: e.target.value } })} rows={4} className="w-full px-3 py-2 bg-void border border-primary/30 rounded-sm text-text-main" />
      </div>
      {error && <p className="text-accent text-sm">{error}</p>}
      <div className="flex gap-2">
        <Link href="/admin/characters" className="px-4 py-2 font-ui text-sm text-text-muted hover:text-text-main">Cancel</Link>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-void font-ui text-sm rounded-sm hover:opacity-90 disabled:opacity-50">{loading ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
