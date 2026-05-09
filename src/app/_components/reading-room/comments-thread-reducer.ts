import type { CommentWithAuthorAndLike } from "@/lib/db/comments";

export type CommentsThreadState = {
  comments: CommentWithAuthorAndLike[];
  loading: boolean;
  error: string | null;
  inputValue: string;
  submitting: boolean;
  inputError: string | null;
  showAuthPrompt: boolean;
  authPromptMessage: string | undefined;
};

export const initialCommentsThreadState: CommentsThreadState = {
  comments: [],
  loading: false,
  error: null,
  inputValue: "",
  submitting: false,
  inputError: null,
  showAuthPrompt: false,
  authPromptMessage: undefined,
};

export type CommentsThreadAction =
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

export function commentsThreadReducer(
  state: CommentsThreadState,
  action: CommentsThreadAction
): CommentsThreadState {
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
