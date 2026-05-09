/** Shared reducers for admin dashboard "create" modals (React Doctor useReducer). */

export type ChaptersCreateState = {
  open: boolean;
  novelId: string;
  chapterNumber: string;
  title: string;
  content: string;
  isFree: boolean;
  loading: boolean;
  error: string | null;
};

export const initialChaptersCreateState: ChaptersCreateState = {
  open: false,
  novelId: "",
  chapterNumber: "",
  title: "",
  content: "",
  isFree: false,
  loading: false,
  error: null,
};

export type ChaptersCreateAction =
  | { type: "open" }
  | { type: "close" }
  | {
      type: "patch";
      patch: Partial<
        Pick<
          ChaptersCreateState,
          | "novelId"
          | "chapterNumber"
          | "title"
          | "content"
          | "isFree"
        >
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null }
  | { type: "success_reset" };

export function chaptersCreateReducer(
  state: ChaptersCreateState,
  action: ChaptersCreateAction
): ChaptersCreateState {
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false, error: null };
    case "patch":
      return { ...state, ...action.patch, error: null };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    case "success_reset":
      return { ...initialChaptersCreateState };
    default:
      return state;
  }
}

export type NovelsCreateState = {
  open: boolean;
  title: string;
  authorId: string;
  seriesId: string;
  coverImageUrl: string;
  synopsis: string;
  genreTags: string;
  loading: boolean;
  error: string | null;
};

export const initialNovelsCreateState: NovelsCreateState = {
  open: false,
  title: "",
  authorId: "",
  seriesId: "",
  coverImageUrl: "",
  synopsis: "",
  genreTags: "",
  loading: false,
  error: null,
};

export type NovelsCreateAction =
  | { type: "open" }
  | { type: "close" }
  | {
      type: "patch";
      patch: Partial<
        Pick<
          NovelsCreateState,
          | "title"
          | "authorId"
          | "seriesId"
          | "coverImageUrl"
          | "synopsis"
          | "genreTags"
        >
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null }
  | { type: "success_reset" };

export function novelsCreateReducer(
  state: NovelsCreateState,
  action: NovelsCreateAction
): NovelsCreateState {
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false, error: null };
    case "patch":
      return { ...state, ...action.patch, error: null };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    case "success_reset":
      return { ...initialNovelsCreateState };
    default:
      return state;
  }
}

export type CharactersCreateState = {
  open: boolean;
  novelId: string;
  name: string;
  role: string;
  portraitUrl: string;
  description: string;
  backstory: string;
  loading: boolean;
  error: string | null;
};

export const initialCharactersCreateState: CharactersCreateState = {
  open: false,
  novelId: "",
  name: "",
  role: "",
  portraitUrl: "",
  description: "",
  backstory: "",
  loading: false,
  error: null,
};

export type CharactersCreateAction =
  | { type: "open" }
  | { type: "close" }
  | {
      type: "patch";
      patch: Partial<
        Pick<
          CharactersCreateState,
          | "novelId"
          | "name"
          | "role"
          | "portraitUrl"
          | "description"
          | "backstory"
        >
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null }
  | { type: "success_reset" };

export function charactersCreateReducer(
  state: CharactersCreateState,
  action: CharactersCreateAction
): CharactersCreateState {
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false, error: null };
    case "patch":
      return { ...state, ...action.patch, error: null };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    case "success_reset":
      return { ...initialCharactersCreateState };
    default:
      return state;
  }
}

export type SeriesCreateState = {
  open: boolean;
  title: string;
  authorId: string;
  description: string;
  genreTags: string;
  loading: boolean;
  error: string | null;
};

export const initialSeriesCreateState: SeriesCreateState = {
  open: false,
  title: "",
  authorId: "",
  description: "",
  genreTags: "",
  loading: false,
  error: null,
};

export type SeriesCreateAction =
  | { type: "open" }
  | { type: "close" }
  | {
      type: "patch";
      patch: Partial<
        Pick<SeriesCreateState, "title" | "authorId" | "description" | "genreTags">
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null }
  | { type: "success_reset" };

export function seriesCreateReducer(
  state: SeriesCreateState,
  action: SeriesCreateAction
): SeriesCreateState {
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false, error: null };
    case "patch":
      return { ...state, ...action.patch, error: null };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    case "success_reset":
      return { ...initialSeriesCreateState };
    default:
      return state;
  }
}

export type AuthorsCreateState = {
  open: boolean;
  name: string;
  biography: string;
  avatarUrl: string;
  styleTags: string;
  loading: boolean;
  error: string | null;
};

export const initialAuthorsCreateState: AuthorsCreateState = {
  open: false,
  name: "",
  biography: "",
  avatarUrl: "",
  styleTags: "",
  loading: false,
  error: null,
};

export type AuthorsCreateAction =
  | { type: "open" }
  | { type: "close" }
  | {
      type: "patch";
      patch: Partial<
        Pick<
          AuthorsCreateState,
          "name" | "biography" | "avatarUrl" | "styleTags"
        >
      >;
    }
  | { type: "submit_start" }
  | { type: "submit_end" }
  | { type: "set_error"; error: string | null }
  | { type: "success_reset" };

export function authorsCreateReducer(
  state: AuthorsCreateState,
  action: AuthorsCreateAction
): AuthorsCreateState {
  switch (action.type) {
    case "open":
      return { ...state, open: true };
    case "close":
      return { ...state, open: false, error: null };
    case "patch":
      return { ...state, ...action.patch, error: null };
    case "submit_start":
      return { ...state, loading: true, error: null };
    case "submit_end":
      return { ...state, loading: false };
    case "set_error":
      return { ...state, error: action.error };
    case "success_reset":
      return { ...initialAuthorsCreateState };
    default:
      return state;
  }
}
