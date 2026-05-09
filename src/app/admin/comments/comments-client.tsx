"use client";

import { useRouter } from "next/navigation";
import { hideCommentAction, restoreCommentAction } from "@/app/actions/admin";
import type { CommentWithReader } from "@/lib/admin/admin-data";
import Link from "next/link";

export function AdminCommentsClient({
  comments,
  includeDeleted,
}: {
  comments: CommentWithReader[];
  includeDeleted: boolean;
}) {
  const { refresh } = useRouter();

  async function handleHide(commentId: string) {
    const result = await hideCommentAction(commentId);
    if (result.success) refresh();
  }

  async function handleRestore(commentId: string) {
    const result = await restoreCommentAction(commentId);
    if (result.success) refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Link
          href={includeDeleted ? "/admin/comments" : "/admin/comments?deleted=1"}
          className="px-4 py-2 font-ui text-sm border border-primary/40 rounded-sm text-primary hover:bg-primary/10"
        >
          {includeDeleted ? "Show active only" : "Show deleted"}
        </Link>
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`bg-surface border rounded-sm p-4 ${
              c.isDeleted ? "border-accent/40 opacity-70" : "border-primary/20"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted mb-2">
              <span>{c.readerDisplayName ?? c.readerEmail}</span>
              <span>•</span>
              <span>{c.novelTitle ?? "Novel"}</span>
              <span>•</span>
              <span>{c.chapterTitle ?? "Chapter"}</span>
              <span>•</span>
              <span>{new Date(c.createdAt).toLocaleString()}</span>
              {c.isDeleted && (
                <span className="text-accent font-ui">(hidden)</span>
              )}
            </div>
            <p className="font-ui text-text-main mb-3 whitespace-pre-wrap">
              {c.isDeleted ? (
                <em className="text-text-muted">This comment has been removed</em>
              ) : (
                c.content
              )}
            </p>
            <div className="flex gap-2">
              {c.isDeleted ? (
                <button
                  type="button"
                  onClick={() => handleRestore(c.id)}
                  className="px-3 py-1 bg-primary/20 text-primary font-ui text-sm rounded-sm hover:bg-primary/30"
                >
                  Restore
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleHide(c.id)}
                  className="px-3 py-1 bg-accent/20 text-accent font-ui text-sm rounded-sm hover:bg-accent/30"
                >
                  Hide
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {comments.length === 0 && (
        <div className="p-8 text-center text-text-muted font-ui">
          No comments {includeDeleted ? "found" : "to moderate"}.
        </div>
      )}
    </div>
  );
}
