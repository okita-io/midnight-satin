#!/usr/bin/env node
/** Author's Study — mobile + tablet two-column → the_authors_study.pen */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  artboardX,
  backControl,
  bottomNav,
  goldPill,
  icon,
  sectionHeaderRow,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBBixv27MT2puSBT-Uw-qqmEVbSU5xLGHOfoei7mq9GPeVMax46yGnQMGxMXlB-8IvNvEIqUHh9M2amvfMpkMw2yaS0GRd4TOXO-BUrnSDBCpWQE39CH58A1sLLUpgTOW5v_Lyv-QuAvJBriKWe9doJgfnboGi9h7LTgdI5nHz64EvgbF2up_HxpMx1VZZvrjOH3ABH8DU-Eq1e6qtV-uRUN3CXivh1xtV1Ivt29EAC9ot2NidjFP3wVwIYV41ljyEsXtSonC799EE";
const COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAWXl4paH8tw-7BvkMnhTPKLjxmH8nThGmIcJeuhJZPdKWjxlAWYmi7DyGcd_N69mMiQbQWRhAEEfrTzdg0ytX2spYJAfUvK078OxLP-FJc6Z-Va0c2GDJZokObdYp6apJxfZTlK3I1AjePZQ4kBh4PEVaFWCjwuhVIx86uIvZpPwEJ3AlnUzGm6iKE-z4IaiLpULC0-FB6UxQR9b8DNqQUHNoY4B_myjf3pILuGeYPCSzWmmH0vvDG_zsU8gekBdSPvpsal41NIU4";

const BIO =
  "Weaving tales of forbidden desire in Victorian London. Lover of tea, rainstorms, and morally grey anti-heroes who would burn the world for her.";

const GENRE_TAGS = ["Enemies To Lovers", "Slow Burn", "High Heat"];

/** Hex-adjacent portrait chrome (true hex clip isn't in Pencil — tall gold frame matches DS hex avatar intent). */
function hexAvatar(prefix, wide) {
  const w = wide ? 128 : 112;
  const h = wide ? 144 : 128;
  return {
    type: "frame",
    id: `${prefix}-av-wrap`,
    layout: "none",
    width: w + 8,
    // Extra bottom room so Online chip isn't clipped
    height: h + 24,
    children: [
      {
        type: "rectangle",
        id: `${prefix}-av-ring`,
        x: 0,
        y: 0,
        width: w + 8,
        height: h + 8,
        cornerRadius: 4,
        fill: {
          type: "gradient",
          gradientType: "linear",
          colors: [
            { color: "#D4AF37", position: 0 },
            { color: "#8A7018", position: 1 },
          ],
        },
        effect: {
          type: "shadow",
          shadowType: "outer",
          color: "#D4AF3766",
          offset: { x: 0, y: 0 },
          blur: 24,
        },
      },
      {
        type: "rectangle",
        id: `${prefix}-av`,
        x: 4,
        y: 4,
        width: w,
        height: h,
        cornerRadius: 2,
        fill: { type: "image", url: AVATAR, mode: "fill" },
      },
      {
        type: "frame",
        id: `${prefix}-online`,
        // Chip ~62px; keep fully inside wrap (w+8) so "Online" isn't clipped
        x: Math.max(0, w + 8 - 62),
        y: h - 4,
        height: 22,
        fill: "$color.void",
        cornerRadius: 999,
        stroke: { align: "inside", thickness: 1, fill: "$color.primary" },
        layout: "horizontal",
        gap: 4,
        padding: [2, 8],
        alignItems: "center",
        children: [
          {
            type: "ellipse",
            id: `${prefix}-online-dot`,
            width: 6,
            height: 6,
            fill: "#22C55E",
          },
          text(`${prefix}-online-t`, "Online", {
            fontFamily: "Marcellus",
            fontSize: 10,
            fill: "$color.primary",
            letterSpacing: 1,
          }),
        ],
      },
    ],
  };
}

function statsRow(prefix, align) {
  const stat = (key, value, label) => ({
    type: "frame",
    id: `${prefix}-stat-${key}`,
    layout: "vertical",
    gap: 2,
    alignItems: "center",
    children: [
      text(`${prefix}-stat-${key}-v`, value, {
        fontFamily: "Playfair Display",
        fontSize: 18,
        fill: "$color.primary",
      }),
      text(`${prefix}-stat-${key}-l`, label, {
        fontFamily: "Marcellus",
        fontSize: 10,
        fill: "$color.textMuted",
        letterSpacing: 1.5,
      }),
    ],
  });
  const rule = (i) => ({
    type: "rectangle",
    id: `${prefix}-stat-rule-${i}`,
    width: 1,
    height: 32,
    fill: "#393528",
  });
  return {
    type: "frame",
    id: `${prefix}-stats`,
    layout: "horizontal",
    gap: 20,
    alignItems: "center",
    justifyContent: align === "start" ? "start" : "center",
    children: [
      stat("works", "12", "Works"),
      rule(0),
      stat("followers", "4.5k", "Followers"),
      rule(1),
      stat("rating", "4.9", "Rating"),
    ],
  };
}

function actionRow(prefix, wide) {
  return {
    type: "frame",
    id: `${prefix}-actions`,
    layout: "horizontal",
    gap: 12,
    width: wide ? 320 : "fill_container",
    children: [
      {
        ...goldPill(`${prefix}-follow`, "FOLLOW"),
        width: "fill_container",
      },
      {
        type: "frame",
        id: `${prefix}-notify`,
        width: 48,
        height: 44,
        cornerRadius: 2,
        stroke: { align: "inside", thickness: 1, fill: "#393528" },
        layout: "horizontal",
        justifyContent: "center",
        alignItems: "center",
        children: [icon(`${prefix}-notify-i`, "notifications", { size: 22 })],
      },
    ],
  };
}

function authorHeader(prefix, wide) {
  const contentW = wide ? 400 : MOBILE_W - 48;
  return {
    type: "frame",
    id: `${prefix}-head`,
    width: "fill_container",
    layout: wide ? "horizontal" : "vertical",
    gap: 24,
    alignItems: "center",
    padding: wide ? [24, 40] : [16, 24, 8, 24],
    children: [
      hexAvatar(prefix, wide),
      {
        type: "frame",
        id: `${prefix}-meta`,
        layout: "vertical",
        gap: 12,
        alignItems: wide ? "start" : "center",
        width: wide ? "fill_container" : contentW,
        children: [
          text(`${prefix}-name`, "Genevieve D'Orsay", {
            fontFamily: "Playfair Display",
            fontSize: wide ? 32 : 28,
            fontStyle: "italic",
            fontWeight: "700",
            textAlign: wide ? "left" : "center",
            width: contentW,
          }),
          text(`${prefix}-tags`, "Historical Romance • Gothic", {
            fontFamily: "Marcellus",
            fontSize: 12,
            fill: "$color.textMuted",
            letterSpacing: 2,
            textAlign: wide ? "left" : "center",
            width: contentW,
          }),
          statsRow(prefix, wide ? "start" : "center"),
          actionRow(prefix, wide),
        ],
      },
    ],
  };
}

function genreTagRow(prefix) {
  return {
    type: "frame",
    id: `${prefix}-genre-tags`,
    layout: "horizontal",
    gap: 8,
    justifyContent: "center",
    width: "fill_container",
    children: GENRE_TAGS.map((label, i) => ({
      type: "frame",
      id: `${prefix}-genre-${i}`,
      padding: [4, 12],
      cornerRadius: 2,
      fill: "#05050580",
      stroke: { align: "inside", thickness: 1, fill: "#D4AF3799" },
      children: [
        text(`${prefix}-genre-${i}-t`, label, {
          fontFamily: "Marcellus",
          fontSize: 10,
          fill: "$color.primary",
          letterSpacing: 1.5,
        }),
      ],
    })),
  };
}

function bio(prefix, w) {
  return {
    type: "frame",
    id: `${prefix}-bio`,
    layout: "vertical",
    gap: 12,
    padding: [8, 0],
    alignItems: "center",
    // Fixed width so genre-tags fill_container isn't circular with fit_content parent
    width: w,
    children: [
      text(`${prefix}-bio-q`, '"', {
        fontFamily: "Playfair Display",
        fontSize: 36,
        fill: "#393528",
      }),
      text(`${prefix}-bio-b`, BIO, {
        fontFamily: "Literata",
        fontSize: 16,
        fontStyle: "italic",
        lineHeight: 1.55,
        textAlign: "center",
        width: w,
      }),
      genreTagRow(prefix),
    ],
  };
}

function trophyCase(prefix) {
  const trophies = [
    { glyph: "history_edu", title: "Golden Quill", sub: "Top Rated 2023" },
    { glyph: "favorite", title: "Million Roses", sub: "1M+ Endorsements" },
    { glyph: "dark_mode", title: "Night Owl", sub: "Most Read @ 3AM" },
  ];
  return {
    type: "frame",
    id: `${prefix}-trophies`,
    width: "fill_container",
    layout: "vertical",
    gap: 12,
    padding: [16, 0],
    stroke: { align: "inside", thickness: { top: 1, bottom: 1 }, fill: "#3935284D" },
    children: [
      sectionHeaderRow(`${prefix}-trophy-h`, "Trophy Case", { viewAll: true }),
      {
        type: "frame",
        id: `${prefix}-trophy-row`,
        layout: "horizontal",
        gap: 8,
        width: "fill_container",
        children: trophies.map((t, i) => ({
          type: "frame",
          id: `${prefix}-trophy-${i}`,
          layout: "vertical",
          gap: 6,
          alignItems: "center",
          width: "fill_container",
          padding: [12, 4],
          children: [
            icon(`${prefix}-trophy-${i}-i`, t.glyph, { size: 28 }),
            text(`${prefix}-trophy-${i}-t`, t.title, {
              fontFamily: "Playfair Display",
              fontSize: 11,
              fontWeight: "700",
              textAlign: "center",
              width: 100,
            }),
            text(`${prefix}-trophy-${i}-s`, t.sub, {
              fontFamily: "Marcellus",
              fontSize: 9,
              fill: "$color.textMuted",
              letterSpacing: 1,
              textAlign: "center",
              width: 100,
            }),
          ],
        })),
      },
    ],
  };
}

function biblio(prefix) {
  return {
    type: "frame",
    id: `${prefix}-biblio`,
    layout: "vertical",
    gap: 12,
    children: [
      text(`${prefix}-bib-h`, "Bibliography", {
        fontFamily: "Cinzel",
        fontSize: 11,
        fill: "$color.textMuted",
        letterSpacing: 2,
      }),
      {
        type: "frame",
        id: `${prefix}-bib-row`,
        layout: "horizontal",
        gap: 16,
        children: [0, 1, 2].map((i) => ({
          type: "rectangle",
          id: `${prefix}-bib-${i}`,
          width: 100,
          height: 150,
          cornerRadius: 2,
          fill: { type: "image", url: COVER, mode: "fill" },
          stroke: { align: "inside", thickness: 1, fill: "#FFFFFF0D" },
        })),
      },
    ],
  };
}

writePen(path.join(__dirname, "the_authors_study.pen"), [
  {
    id: "artboard-author-mobile",
    name: "Author's Study — the_authors_study.html",
    type: "frame",
    x: artboardX(0),
    y: 0,
    width: MOBILE_W,
    height: 1100,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      {
        type: "frame",
        id: "am-top",
        width: "fill_container",
        padding: [16, 16, 0, 16],
        children: [backControl("am-back", "Back", { fill: "#FFFFFF" })],
      },
      authorHeader("am", false),
      {
        type: "frame",
        id: "am-body",
        width: "fill_container",
        height: "fill_container",
        layout: "vertical",
        gap: 20,
        padding: [8, 24, 24, 24],
        children: [bio("am", MOBILE_W - 48), trophyCase("am"), biblio("am")],
      },
      bottomNav("am", "library"),
    ],
  },
  {
    id: "artboard-author-tablet",
    name: "Author's Study — tablet two-column",
    type: "frame",
    x: artboardX(1),
    y: 0,
    width: TABLET_W,
    height: 820,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      authorHeader("at", true),
      {
        type: "frame",
        id: "at-cols",
        width: "fill_container",
        height: "fill_container",
        layout: "horizontal",
        gap: 40,
        padding: [16, 40, 32, 40],
        children: [
          {
            type: "frame",
            id: "at-left",
            width: 360,
            layout: "vertical",
            gap: 20,
            children: [bio("at", 360), trophyCase("at")],
          },
          {
            type: "frame",
            id: "at-right",
            width: "fill_container",
            layout: "vertical",
            children: [biblio("at")],
          },
        ],
      },
      bottomNav("at", "library"),
    ],
  },
]);
