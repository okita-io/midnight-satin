/** Reader typography + localStorage (shared by ReadingHUD and reading-room client). */

export const FONT_SIZES = [16, 18, 20] as const;
export const LINE_HEIGHTS = [1.4, 1.6, 1.8] as const;

export type FontSize = (typeof FONT_SIZES)[number];
export type LineHeight = (typeof LINE_HEIGHTS)[number];

const STORAGE_KEY = "midnight-satin-reader-settings";

export interface ReaderSettings {
  fontSize: FontSize;
  lineHeight: LineHeight;
}

/** Matches SSR and empty localStorage; use for initial client state before hydration completes. */
export const DEFAULT_READER_SETTINGS: ReaderSettings = {
  fontSize: 18,
  lineHeight: 1.6,
};

export function getStoredReaderSettings(): ReaderSettings {
  if (typeof window === "undefined") {
    return DEFAULT_READER_SETTINGS;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_READER_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ReaderSettings>;
    return {
      fontSize: FONT_SIZES.includes(parsed.fontSize as FontSize)
        ? (parsed.fontSize as FontSize)
        : DEFAULT_READER_SETTINGS.fontSize,
      lineHeight: LINE_HEIGHTS.includes(parsed.lineHeight as LineHeight)
        ? (parsed.lineHeight as LineHeight)
        : DEFAULT_READER_SETTINGS.lineHeight,
    };
  } catch {
    return DEFAULT_READER_SETTINGS;
  }
}

export function setStoredReaderSettings(settings: ReaderSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* ignore */
  }
}
