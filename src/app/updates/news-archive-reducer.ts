import type { NewsArticleSummary } from "@/lib/db/types";

export type NewsArchiveState = {
  articles: NewsArticleSummary[];
  cursor: string | null;
};

export type NewsArchiveAction =
  | {
      type: "reset";
      articles: NewsArticleSummary[];
      cursor: string | null;
    }
  | {
      type: "append";
      articles: NewsArticleSummary[];
      cursor: string | null;
    };

export function newsArchiveReducer(
  state: NewsArchiveState,
  action: NewsArchiveAction
): NewsArchiveState {
  switch (action.type) {
    case "reset":
      return { articles: action.articles, cursor: action.cursor };
    case "append":
      return {
        articles: [...state.articles, ...action.articles],
        cursor: action.cursor,
      };
    default:
      return state;
  }
}
