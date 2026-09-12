import { describe, it, expect } from "vitest";
import {
  SITE_NAME,
  BOUDOIR_TITLE,
  BOUDOIR_DESCRIPTION,
  BOUDOIR_HEADING,
  BOUDOIR_BYLINE,
  sitePageMetadata,
} from "@/lib/site-metadata";

describe("site metadata helpers", () => {
  it("boudoir title is a heading-style page title, not only a brand slug", () => {
    expect(BOUDOIR_TITLE).toBe("The Boudoir | Midnight Satin");
  });

  it("boudoir H1 names the product and the byline answers what the app is", () => {
    expect(BOUDOIR_HEADING).toBe(SITE_NAME);
    expect(BOUDOIR_BYLINE).toContain("Midnight Satin");
    expect(BOUDOIR_BYLINE.toLowerCase()).toContain("romance");
    expect(BOUDOIR_BYLINE.length).toBeGreaterThanOrEqual(100);
  });

  it("boudoir description is 120-155 characters", () => {
    expect(BOUDOIR_DESCRIPTION.length).toBeGreaterThanOrEqual(120);
    expect(BOUDOIR_DESCRIPTION.length).toBeLessThanOrEqual(155);
  });

  it("sitePageMetadata prefixes the brand", () => {
    const meta = sitePageMetadata("Library", "Browse novels.");
    expect(meta.title).toBe("Library | Midnight Satin");
    expect(meta.description).toBe("Browse novels.");
  });
});
