"use client";

/**
 * CommentsSidebar — desktop-only fixed sidebar for chapter comments (THE-62).
 * Fixed right, 320px width, independent scrolling. Hidden on mobile/tablet (lg: only).
 * Reuses comment styling from CommentsSection (dark background, gold accents).
 */

import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  getChapterComments,
  postComment,
  likeComment,
  unlikeComment,
  type GetChapterCommentsResult,
} from "@/app/actions/comments";
import type { CommentWithAuthorAndLike } from "@/lib/db/comments";
import { MAX_COMMENT_LENGTH, validateCommentContent } from "@/lib/comments/validation";
import {
  COMMENTS_HEADER_TITLE,
  COMMENTS_HEADER_CLASSES,
  COMMENT_AUTHOR_CLASSES,
  COMMENT_CONTENT_CLASSES,
  COMMENT_LIKE_CLASSES,
  READING_ROOM_SIDEBAR_BOTTOM_OFFSET_WHEN_HUD_VISIBLE,
} from "@/lib/comments-ui-constants";
import { AuthPrompt } from "@/app/_components/auth-prompt";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

type SidebarState = {
  comments: CommentWithAuthorAndLike[];
  loading: boolean;
  error: string | null;
  inputValue: string;
  submitting: boolean;
  inputError: string | null;
  showAuthPrompt: boolean;
  authPromptMessage: string | undefined;
};

const initialSidebarState: SidebarState = {
  comments: [],
  loading: false,
  error: null,
  inputValue: "",
  submitting: false,
  inputError: null,
  showAuthPrompt: false,
  authPromptMessage: undefined,
};

type SidebarAction =
  | { type: "load_start" }
  | { type: "load_success"; comments: CommentWithAuthorAndLike[] }
  | { type: "load_error"; error: string }
  | { type: "set_input"; value: string }
  | { type: "set_input_error"; error: string | null }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "post_success" }
  | { type: "auth_open"; message?: string }
  | { type: "auth_close" }
  | {
      type: "update_comment_like";
      commentId: string;
      newLikeCount: number;
      likedByCurrentReader: boolean;
    };

function sidebarReducer(state: SidebarState, action: SidebarAction): SidebarState {
  switch (action.type) {
    case "load_start":
      return { ...state, loading: true, error: null };
    case "load_success":
      return { ...state, loading: false, comments: action.comments };
    case "load_error":
      return { ...state, loading: false, error: action.error };
    case "set_input":
      return { ...state, inputValue: action.value, inputError: null };
    case "set_input_error":
      return { ...state, inputError: action.error };
    case "submit_start":
      return { ...state, submitting: true };
    case "submit_end":
      return { ...state, submitting: false };
    case "post_success":
      return { ...state, inputValue: "", inputError: null };
    case "auth_open":
      return {
        ...state,
        showAuthPrompt: true,
        authPromptMessage: action.message,
      };
    case "auth_close":
      return { ...state, showAuthPrompt: false };
    case "update_comment_like":
      return {
        ...state,
        comments: state.comments.map((c) =>
          c.id === action.commentId
            ? {
                ...c,
                likeCount: action.newLikeCount,
                likedByCurrentReader: action.likedByCurrentReader,
              }
            : c
        ),
      };
    default:
      return state;
  }
}

export interface CommentsSidebarProps {
  chapterId: string;
  isAuthenticated: boolean;
  commentCount: number;
  /** When true, sidebar bottom clears the fixed ReadingHUD; when false, extends to viewport bottom. */
  readingHudVisible: boolean;
  onCommentCountChange?: (count: number) => void;
  returnUrl?: string;
}

export function CommentsSidebar({
  chapterId,
  isAuthenticated,
  commentCount,
  readingHudVisible,
  onCommentCountChange,
  returnUrl,
}: CommentsSidebarProps) {
  const [state, dispatch] = useReducer(sidebarReducer, initialSidebarState);
  const loadGenRef = useRef(0);

  const fetchCommentsForChapter = useCallback((id: string) => {
    if (!id) return;
    const gen = ++loadGenRef.current;
    dispatch({ type: "load_start" });
    void (async () => {
      const result: GetChapterCommentsResult = await getChapterComments(id);
      if (gen !== loadGenRef.current) return;
      if (result.success) {
        dispatch({
          type: "load_success",
          comments: result.data.commentsWithAuthor,
        });
      } else {
        dispatch({
          type: "load_error",
          error: result.error ?? "Failed to load comments.",
        });
      }
    })();
  }, []);

  useEffect(() => {
    if (!chapterId) return;
    fetchCommentsForChapter(chapterId);
  }, [chapterId, fetchCommentsForChapter]);

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      dispatch({
        type: "auth_open",
        message: "Sign in to add a thought.",
      });
      return;
    }
    const trimmed = state.inputValue.trim();
    const validation = validateCommentContent(state.inputValue);
    if (!validation.valid) {
      dispatch({ type: "set_input_error", error: validation.error });
      return;
    }
    if (!chapterId || !trimmed) {
      return;
    }
    dispatch({ type: "submit_start" });
    const result = await postComment(chapterId, trimmed);
    dispatch({ type: "submit_end" });
    if (result.success) {
      dispatch({ type: "post_success" });
      fetchCommentsForChapter(chapterId);
      onCommentCountChange?.(commentCount + 1);
    } else {
      dispatch({
        type: "set_input_error",
        error: result.error ?? "Failed to post.",
      });
    }
  }, [
    isAuthenticated,
    state.inputValue,
    chapterId,
    commentCount,
    onCommentCountChange,
    fetchCommentsForChapter,
  ]);

  const handleLike = useCallback(
    async (commentId: string, currentlyLiked: boolean) => {
      if (!isAuthenticated) {
        dispatch({
          type: "auth_open",
          message: "Sign in to like comments.",
        });
        return;
      }
      const result = currentlyLiked
        ? await unlikeComment(commentId)
        : await likeComment(commentId);
      if (result.success) {
        dispatch({
          type: "update_comment_like",
          commentId,
          newLikeCount: result.newLikeCount,
          likedByCurrentReader: !currentlyLiked,
        });
      }
    },
    [isAuthenticated]
  );

  const {
    comments,
    loading,
    error,
    inputValue,
    submitting,
    inputError,
    showAuthPrompt,
    authPromptMessage,
  } = state;

  return (
    <>
      {/* Desktop-only fixed sidebar - hidden on mobile/tablet */}
      <aside
        className="hidden lg:flex lg:flex-col fixed right-0 top-0 bottom-0 w-80 z-40 bg-gradient-to-b from-surface to-void border-l border-primary/40 shadow-[-10px_0_40px_rgba(0,0,0,0.8)] lg:[bottom:var(--reading-sidebar-bottom)] lg:transition-[bottom] lg:duration-300 lg:ease-in-out"
        style={{
          paddingTop: "env(safe-area-inset-top, 0px)",
          ["--reading-sidebar-bottom" as string]: readingHudVisible
            ? READING_ROOM_SIDEBAR_BOTTOM_OFFSET_WHEN_HUD_VISIBLE
            : "0px",
        }}
        aria-label="Chapter comments"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className={COMMENTS_HEADER_CLASSES}>
            {COMMENTS_HEADER_TITLE}
          </h2>
          <span className="font-ui text-[10px] text-text-muted">
            {commentCount} {commentCount === 1 ? "ENTRY" : "ENTRIES"}
          </span>
        </div>

        {/* Scrollable comment list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 min-h-0">
          {loading && (
            <p className="font-ui text-sm text-text-muted italic">
              Loading thoughts…
            </p>
          )}
          {error && (
            <p className="font-ui text-sm text-accent">{error}</p>
          )}
          {!loading && !error && comments.length === 0 && (
            <p className="font-ui text-sm text-text-muted italic">
              No thoughts yet. Be the first to share.
            </p>
          )}
          {!loading &&
            !error &&
            comments.map((c) => (
              <CommentItem
                key={c.id}
                comment={c}
                onLike={() => handleLike(c.id, c.likedByCurrentReader)}
                isAuthenticated={isAuthenticated}
                onAuthRequired={() => {
                  dispatch({
                    type: "auth_open",
                    message: "Sign in to like comments.",
                  });
                }}
              />
            ))}
        </div>

        {/* Input form */}
        <div className="p-6 border-t border-white/5 bg-void/50 shrink-0">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => {
                dispatch({ type: "set_input", value: e.target.value });
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder={isAuthenticated ? "Add a thought…" : "Sign in to add a thought"}
              maxLength={MAX_COMMENT_LENGTH}
              rows={2}
              className="w-full bg-transparent border-0 border-b border-primary/30 py-2 px-0 text-sm font-body italic focus:ring-0 focus:border-primary placeholder:text-text-muted text-text-main transition-colors resize-none"
              disabled={!isAuthenticated || submitting}
              aria-label="Add a comment"
              aria-invalid={!!inputError}
              aria-describedby={inputError ? "sidebar-comment-input-error" : undefined}
            />
            <div className="flex items-center justify-between mt-1">
              <span
                id="sidebar-comment-input-error"
                className={`text-xs font-ui ${inputError ? "text-accent" : "text-text-muted"}`}
              >
                {inputError ?? (inputValue.length > 0 ? `${inputValue.length}/${MAX_COMMENT_LENGTH}` : "")}
              </span>
              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!isAuthenticated || submitting || !inputValue.trim()}
                className="text-primary hover:text-primary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer active:scale-95"
                aria-label="Post comment"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: 20 }}
                >
                  history_edu
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <AuthPrompt
        isOpen={showAuthPrompt}
        onClose={() => dispatch({ type: "auth_close" })}
        returnUrl={returnUrl}
        message={authPromptMessage}
      />
    </>
  );
}

interface CommentItemProps {
  comment: CommentWithAuthorAndLike;
  onLike: () => void;
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

function CommentItem({
  comment,
  onLike,
  isAuthenticated,
  onAuthRequired,
}: CommentItemProps) {
  const handleLikeClick = () => {
    if (isAuthenticated) {
      onLike();
    } else {
      onAuthRequired();
    }
  };

  const displayName =
    comment.readerDisplayName?.trim() || "Anonymous";
  const displayContent = comment.isDeleted
    ? "This comment has been removed"
    : comment.content;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={COMMENT_AUTHOR_CLASSES}>
            {displayName}
          </span>
          <span
            className="text-[10px] font-ui text-text-muted"
            suppressHydrationWarning
          >
            {formatRelativeTime(new Date(comment.createdAt))}
          </span>
        </div>
        {!comment.isDeleted && (
          <button
            type="button"
            onClick={handleLikeClick}
            className={COMMENT_LIKE_CLASSES}
            aria-label={comment.likedByCurrentReader ? "Unlike" : "Like"}
          >
            <span className="text-[10px] font-ui">{comment.likeCount}</span>
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 14,
                fontVariationSettings: comment.likedByCurrentReader
                  ? "'FILL' 1"
                  : "'FILL' 0",
              }}
            >
              favorite
            </span>
          </button>
        )}
      </div>
      <p
        className={`${COMMENT_CONTENT_CLASSES} whitespace-pre-wrap ${
          comment.isDeleted ? "text-text-muted" : "text-text-main/80"
        }`}
      >
        {displayContent}
      </p>
    </div>
  );
}
