import {
  DEFAULT_READER_SETTINGS,
  type ReaderSettings,
} from "./reading-hud";

export type ReadingRoomClientState = {
  hudVisible: boolean;
  commentsOpen: boolean;
  commentCount: number;
  progressPercent: number;
  settings: ReaderSettings;
  unlocked: boolean;
  creditBalance: number;
  unlockError: string | null;
  isUnlocking: boolean;
  syncedChapterId: string;
};

export function createReadingRoomInitialState(
  chapterId: string,
  opts: {
    initialCommentCount: number;
    isUnlocked: boolean;
    initialCreditBalance: number;
  }
): ReadingRoomClientState {
  return {
    hudVisible: false,
    commentsOpen: false,
    commentCount: opts.initialCommentCount,
    progressPercent: 0,
    settings: { ...DEFAULT_READER_SETTINGS },
    unlocked: opts.isUnlocked,
    creditBalance: opts.initialCreditBalance,
    unlockError: null,
    isUnlocking: false,
    syncedChapterId: chapterId,
  };
}

export type ReadingRoomClientAction =
  | {
      type: "sync_chapter_props";
      chapterId: string;
      initialCommentCount: number;
      isUnlocked: boolean;
      initialCreditBalance: number;
    }
  | { type: "toggle_hud" }
  | { type: "set_comments_open"; open: boolean }
  | { type: "set_comment_count"; count: number }
  | { type: "set_progress_percent"; percent: number }
  | { type: "set_settings"; settings: ReaderSettings }
  | { type: "unlock_start" }
  | { type: "unlock_success"; newBalance: number }
  | { type: "unlock_fail"; error: string };

export function readingRoomClientReducer(
  state: ReadingRoomClientState,
  action: ReadingRoomClientAction
): ReadingRoomClientState {
  switch (action.type) {
    case "sync_chapter_props":
      if (action.chapterId === state.syncedChapterId) return state;
      return {
        ...state,
        syncedChapterId: action.chapterId,
        commentCount: action.initialCommentCount,
        unlocked: action.isUnlocked,
        creditBalance: action.initialCreditBalance,
      };
    case "toggle_hud":
      return { ...state, hudVisible: !state.hudVisible };
    case "set_comments_open":
      return { ...state, commentsOpen: action.open };
    case "set_comment_count":
      return { ...state, commentCount: action.count };
    case "set_progress_percent":
      return { ...state, progressPercent: action.percent };
    case "set_settings":
      return { ...state, settings: action.settings };
    case "unlock_start":
      return { ...state, unlockError: null, isUnlocking: true };
    case "unlock_success":
      return {
        ...state,
        isUnlocking: false,
        unlocked: true,
        creditBalance: action.newBalance,
      };
    case "unlock_fail":
      return {
        ...state,
        isUnlocking: false,
        unlockError: action.error,
      };
    default:
      return state;
  }
}
