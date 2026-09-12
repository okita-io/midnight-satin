import type { Metadata } from "next";

export const SITE_NAME = "Midnight Satin";

/** Default description for pages that do not need a long unique blurb. */
export const defaultDescription =
  "A premium reading experience for romance lovers — discover novels, authors, and the Midnight Satin library.";

export const BOUDOIR_TITLE = "The Boudoir | Midnight Satin";

/** 120 characters: offer + reason to open The Boudoir. */
export const BOUDOIR_DESCRIPTION =
  "Read serialized romance in The Boudoir — featured novels, trending chapters, and a private library made for late nights.";

/** Visible H1 on The Boudoir. Keep aligned with SITE_NAME for entity clarity. */
export const BOUDOIR_HEADING = SITE_NAME;

/** On-page answer block: what Midnight Satin is, in crawlable HTML. */
export const BOUDOIR_BYLINE =
  "Midnight Satin is a serialized romance library. Read featured novels and spicy chapters on your phone — a private shelf for late nights, not a chatbot.";

export function sitePageMetadata(
  titleSegment: string,
  description: string = defaultDescription
): Metadata {
  return {
    title: `${titleSegment} | ${SITE_NAME}`,
    description,
  };
}
