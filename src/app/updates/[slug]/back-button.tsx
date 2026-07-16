"use client";

import { BackButton as CatalogBackButton } from "@/components/ui";

/**
 * Back button that navigates to the previous page, or falls back to home.
 * Thin route wrapper around the catalog `BackButton` (MS · Back · Icon + label).
 */
export function BackButton() {
  return <CatalogBackButton fallbackHref="/" />;
}
