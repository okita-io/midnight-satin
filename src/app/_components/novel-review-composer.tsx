"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  postNovelReview,
  updateNovelReview,
  deleteNovelReview,
} from "@/app/actions/novel-reviews";
import { MAX_NOVEL_REVIEW_LENGTH } from "@/lib/reviews/validation";

interface NovelReviewComposerProps {
  novelId: string;
  isAuthenticated: boolean;
  /** Path for login returnUrl (novel detail or reviews subpage) */
  returnPath: string;
  myReview: { id: string; content: string } | null;
}

export function NovelReviewComposer({
  novelId,
  isAuthenticated,
  returnPath,
  myReview,
}: NovelReviewComposerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState(myReview?.content ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(myReview?.content ?? "");
    setError(null);
  }, [myReview?.id, myReview?.content]);

  if (!isAuthenticated) {
    const loginHref = `/auth/login?returnUrl=${encodeURIComponent(returnPath)}`;
    return (
      <div className="rounded-sm border border-primary/15 bg-white/[0.02] p-4 xs:p-5">
        <p className="font-body text-sm text-text-muted mb-4">
          Share what you thought of this novel.
        </p>
        <Link
          href={loginHref}
          className="inline-flex items-center justify-center w-full font-ui font-bold text-xs uppercase tracking-[0.2em] py-3 rounded-sm border border-primary/40 text-primary hover:bg-primary/10 transition-colors active:scale-[0.99]"
        >
          Sign in to write a review
        </Link>
      </div>
    );
  }

  const trimmed = draft.trim();
  const savedTrim = (myReview?.content ?? "").trim();
  const hasExisting = !!myReview;
  const primaryDisabled =
    pending ||
    trimmed.length === 0 ||
    (hasExisting && trimmed === savedTrim);
  const primaryLabel = hasExisting ? "Update review" : "Submit";

  function submit() {
    setError(null);
    startTransition(async () => {
      if (hasExisting && myReview) {
        const res = await updateNovelReview(novelId, myReview.id, draft);
        if (!res.success) {
          setError(res.error);
          return;
        }
      } else {
        const res = await postNovelReview(novelId, draft);
        if (!res.success) {
          setError(res.error);
          return;
        }
      }
      router.refresh();
    });
  }

  function remove() {
    if (!myReview) return;
    if (
      !window.confirm(
        "Remove your review? It will no longer appear for other readers.",
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteNovelReview(novelId, myReview.id);
      if (!res.success) {
        setError(res.error);
        return;
      }
      setDraft("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-sm border border-primary/15 bg-white/[0.02] p-4 xs:p-5">
      <label
        htmlFor={`novel-review-${novelId}`}
        className="block font-ui text-xs uppercase tracking-widest text-text-muted mb-2"
      >
        {hasExisting ? "Your review" : "Write a review"}
      </label>
      <textarea
        id={`novel-review-${novelId}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        maxLength={MAX_NOVEL_REVIEW_LENGTH}
        rows={4}
        placeholder="What stayed with you after the last page?"
        className="w-full resize-y min-h-[100px] rounded-sm border border-white/10 bg-void/80 px-3 py-2.5 font-body text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:ring-1 focus:ring-primary/40"
      />
      <div className="flex items-center justify-between mt-2 mb-3">
        <span className="text-[10px] text-text-muted font-ui">
          {draft.length}/{MAX_NOVEL_REVIEW_LENGTH}
        </span>
      </div>
      {error ? (
        <p className="text-xs text-accent mb-2" role="alert">
          {error}
        </p>
      ) : null}
      {hasExisting ? (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            className="flex-1 min-w-0 font-ui font-bold text-xs uppercase tracking-[0.15em] py-3 rounded-sm border border-accent/50 text-accent/90 hover:bg-accent/10 hover:border-accent transition-all active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {pending ? "…" : "Remove review"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={primaryDisabled}
            className="flex-1 min-w-0 font-ui font-bold text-xs uppercase tracking-[0.15em] py-3 rounded-sm transition-all active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100 bg-primary text-void hover:bg-white disabled:hover:bg-primary"
          >
            {pending ? "…" : primaryLabel}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={primaryDisabled}
          className="w-full font-ui font-bold text-xs uppercase tracking-[0.2em] py-3 rounded-sm transition-all active:scale-[0.99] disabled:opacity-35 disabled:cursor-not-allowed disabled:active:scale-100 bg-primary text-void hover:bg-white disabled:hover:bg-primary"
        >
          {pending ? "…" : primaryLabel}
        </button>
      )}
    </div>
  );
}
