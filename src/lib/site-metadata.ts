import type { Metadata } from "next";

const SITE = "Midnight Satin";

/** Default description for pages that do not need a long unique blurb. */
export const defaultDescription =
  "A premium reading experience for romance lovers — discover novels, authors, and the Midnight Satin library.";

export function sitePageMetadata(
  titleSegment: string,
  description: string = defaultDescription
): Metadata {
  return {
    title: `${titleSegment} | ${SITE}`,
    description,
  };
}
