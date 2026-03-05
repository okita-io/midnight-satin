/**
 * Responsive system for Midnight Satin tablet and desktop.
 * @see Linear THE-45
 */

export {
  BREAKPOINTS,
  GRID_COLUMNS,
  MEDIA_QUERIES,
  READING_MAX_WIDTH,
  SIDEBAR_WIDTH,
  type ViewportSize,
} from "./constants";
export { useViewport, usePointerDevice, type ViewportState, type PointerDevice } from "./hooks";
export {
  getViewportSize,
  isTabletOrUp,
  isDesktopOrUp,
  isTouchDevice,
  isFinePointerDevice,
} from "./utils";
