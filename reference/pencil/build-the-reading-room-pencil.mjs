#!/usr/bin/env node
/**
 * Reading Room — mobile 390 + tablet 834 → the_reading_room.pen
 * Sources: the_reading_room.html, the_reading_room_tablet.html
 * Tablet: centered Literata column ~672 inside 834 shell (iPad reading).
 * Composed from DS-aligned helpers in pencil-tokens.mjs.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  TABLET_READ_COL,
  artboardX,
  backControl,
  decorativeRule,
  icon,
  readingHudFooter,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CHAPTER_TITLE = "The Gilded Cage";
const SERIES_LINE = "Midnight Satin • Vol. 1";

const SAMPLE_PARAS = [
  "The candlelight trembled against the velvet drapes as the Duke crossed the threshold. Silk whispered under Isolde's fingertips—a vow already half-broken, half-begun.",
  "Beyond the ballroom, the night held its breath. Every glance was a ledger entry; every smile, a debt waiting to come due.",
  "\"You came,\" he said, as if the words themselves were a confession. She did not answer with her voice. The gold of her bracelet caught the light—and the lie between them.",
  "Outside, rain began to needle the glass. Inside, the waltz resumed without them—a distant tide of strings and murmured scandal that could not reach the silence they had made.",
];

function readingHudTop(prefix, maxContentW) {
  return {
    type: "frame",
    id: `${prefix}-hud-top`,
    width: "fill_container",
    height: 64,
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    padding: [0, 24],
    fill: "$color.navBg",
    stroke: { align: "inside", thickness: { bottom: 1 }, fill: "#1F1F1F" },
    children: [
      backControl(`${prefix}-back`),
      {
        type: "frame",
        id: `${prefix}-title-block`,
        layout: "vertical",
        gap: 2,
        alignItems: "center",
        width: Math.min(maxContentW - 120, 280),
        children: [
          text(`${prefix}-ch-label`, "Chapter IV", {
            fontFamily: "Cinzel",
            fontSize: 10,
            fill: "$color.textMuted",
            letterSpacing: 2,
            textAlign: "center",
            width: 200,
          }),
          text(`${prefix}-ch-name`, CHAPTER_TITLE, {
            fontFamily: "Playfair Display",
            fontSize: 14,
            fontStyle: "italic",
            textAlign: "center",
            width: 200,
          }),
        ],
      },
      icon(`${prefix}-bm`, "bookmark_add", { size: 24, fill: "#D4AF37CC" }),
    ],
  };
}

function chapterBody(prefix, contentWidth) {
  return {
    type: "frame",
    id: `${prefix}-body`,
    width: contentWidth,
    layout: "vertical",
    gap: 20,
    children: [
      decorativeRule(`${prefix}-ornament`),
      text(`${prefix}-h1`, CHAPTER_TITLE, {
        fontFamily: "Playfair Display",
        fontSize: prefix.startsWith("rt") ? 36 : 28,
        fontStyle: "italic",
        fill: "$color.primary",
        textAlign: "center",
        width: contentWidth,
      }),
      text(`${prefix}-sub`, SERIES_LINE, {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.textMuted",
        letterSpacing: 2,
        textAlign: "center",
        width: contentWidth,
      }),
      ...SAMPLE_PARAS.map((p, i) =>
        text(`${prefix}-p-${i}`, p, {
          fontFamily: "Literata",
          fontSize: prefix.startsWith("rt") ? 18 : 16,
          lineHeight: 1.7,
          fill: "#EAEAEAE6",
          width: contentWidth,
        })
      ),
    ],
  };
}

function mobileArtboard() {
  const pad = 24;
  const col = MOBILE_W - pad * 2;
  return {
    id: "artboard-reader-mobile",
    name: "Reading Room — the_reading_room.html",
    type: "frame",
    x: artboardX(0),
    y: 0,
    width: MOBILE_W,
    height: 844,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      readingHudTop("rm", col),
      {
        type: "frame",
        id: "rm-scroll",
        width: "fill_container",
        height: "fill_container",
        layout: "vertical",
        padding: [24, pad, 32, pad],
        children: [chapterBody("rm", col)],
      },
      // ~35% progress (matches HTML scrubber)
      readingHudFooter("rm", { progressFill: Math.round(MOBILE_W * 0.35) }),
    ],
  };
}

function tabletArtboard() {
  const sidePad = Math.floor((TABLET_W - TABLET_READ_COL) / 2);
  return {
    id: "artboard-reader-tablet",
    name: "Reading Room — the_reading_room_tablet.html",
    type: "frame",
    context:
      "iPad portrait 834. Centered reading column max-w-2xl (672). HUD top/bottom; no desktop comments sidebar.",
    x: artboardX(1),
    y: 0,
    width: TABLET_W,
    height: 1112,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      readingHudTop("rt", TABLET_READ_COL),
      {
        type: "frame",
        id: "rt-scroll",
        width: "fill_container",
        height: "fill_container",
        layout: "vertical",
        alignItems: "center",
        padding: [32, sidePad, 40, sidePad],
        children: [chapterBody("rt", TABLET_READ_COL)],
      },
      readingHudFooter("rt", { progressFill: Math.round(TABLET_W * 0.35) }),
    ],
  };
}

writePen(path.join(__dirname, "the_reading_room.pen"), [
  mobileArtboard(),
  tabletArtboard(),
]);
