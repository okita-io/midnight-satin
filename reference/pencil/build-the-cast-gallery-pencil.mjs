#!/usr/bin/env node
/**
 * Cast gallery — mobile 1-col + tablet 2-col → the_cast_gallery.pen
 * Portrait chrome mirrors design_system.pen (Top Pick left + Endorse rose right).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  artboardX,
  castEndorseButton,
  castTopPickBadge,
  icon,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORTRAIT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDbV5TijEhfdu5lu1dP6DSAS6PvVPCnRe2F_k32RLtSk8xYkX8NodrOPWQJjua_E-yqZIzV2zWVDqQuMJtvK5YnXn9o3lU85Y963540yPYWXd-K7toH3Fz05ujkW7kSbxSg9QxMMbsYwlOehSsAWolRd2V1juQEIygZHbAr3QKmspm5mliFndhQ03-q11nhkhMNIhNtUoM_ZV7KugsvY0ItOcYl1o2azfjpKvL-49wCMwujdLxs32uEo7blAGsuDO8JQaO45xyTJc";

const CAST = [
  {
    name: "Duke Alistair",
    role: "The Exiled Heir",
    count: "12,384",
    topPick: true,
    teaser:
      "A brooding exile emerging from the shadows of his past, Alistair returns to a city that forgot him, determined to reclaim a legacy stolen by betrayal.",
  },
  {
    name: "Lady Isolde",
    role: "The Heiress",
    count: "8,102",
    topPick: false,
    teaser:
      "Heiress to a fortune built on whispers, Isolde plays the ballroom like a chessboard—every smile a gambit.",
  },
  {
    name: "Vera Crowe",
    role: "The Spy",
    count: "5,440",
    topPick: false,
    teaser:
      "A ghost in silk gloves. Vera trades secrets the way others trade kisses—softly, and never without a price.",
  },
  {
    name: "Julian Vale",
    role: "The Rival",
    count: "3,901",
    topPick: false,
    teaser:
      "Charm sharpened to a blade. Julian wants the title, the estate, and anything Alistair still dares to love.",
  },
];

function roleRow(idPrefix, role, cardW) {
  return {
    type: "frame",
    id: `${idPrefix}-role-row`,
    layout: "horizontal",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    width: cardW - 48,
    children: [
      {
        type: "rectangle",
        id: `${idPrefix}-role-l`,
        width: 32,
        height: 1,
        fill: "#D4AF3780",
      },
      text(`${idPrefix}-role`, role, {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.primary",
        letterSpacing: 2,
        textAlign: "center",
      }),
      {
        type: "rectangle",
        id: `${idPrefix}-role-r`,
        width: 32,
        height: 1,
        fill: "#D4AF3780",
      },
    ],
  };
}

function portraitCard(prefix, i, cardW) {
  const c = CAST[i];
  const h = Math.max(560, Math.round(cardW * 1.65));
  const idPrefix = `${prefix}-${i}`;
  const children = [
    {
      type: "rectangle",
      id: `${idPrefix}-img`,
      x: 0,
      y: 0,
      width: cardW,
      height: h,
      fill: { type: "image", url: PORTRAIT, mode: "fill" },
    },
    {
      type: "rectangle",
      id: `${idPrefix}-vignette`,
      x: 0,
      y: 0,
      width: cardW,
      height: h,
      fill: {
        type: "gradient",
        gradientType: "linear",
        rotation: 180,
        colors: [
          { color: "#05050500", position: 0 },
          { color: "#05050566", position: 0.45 },
          { color: "#050505EE", position: 1 },
        ],
      },
    },
  ];

  if (c.topPick) {
    children.push(castTopPickBadge(idPrefix));
  }

  children.push(
    castEndorseButton(idPrefix, c.count, { cardW }),
    {
      type: "frame",
      id: `${idPrefix}-meta`,
      x: 0,
      y: h - 220,
      width: cardW,
      layout: "vertical",
      gap: 10,
      padding: [0, 24, 32, 24],
      alignItems: "center",
      children: [
        text(`${idPrefix}-teaser`, c.teaser, {
          fontFamily: "Literata",
          fontSize: 13,
          fontStyle: "italic",
          fill: "#EAEAEA99",
          lineHeight: 1.45,
          textAlign: "center",
          width: cardW - 48,
        }),
        roleRow(idPrefix, c.role, cardW),
        text(`${idPrefix}-name`, c.name, {
          fontFamily: "Playfair Display",
          fontSize: 28,
          fontStyle: "italic",
          fontWeight: "700",
          textAlign: "center",
          width: cardW - 48,
        }),
        {
          type: "frame",
          id: `${idPrefix}-cta`,
          layout: "horizontal",
          gap: 6,
          alignItems: "center",
          children: [
            icon(`${idPrefix}-flip`, "cached", { size: 14, fill: "#FFFFFF66" }),
            text(`${idPrefix}-flip-l`, "Tap to reveal dossier", {
              fontFamily: "Marcellus",
              fontSize: 10,
              fill: "#FFFFFF66",
              letterSpacing: 2,
            }),
          ],
        },
      ],
    }
  );

  return {
    type: "frame",
    id: `${idPrefix}-card`,
    width: cardW,
    height: h,
    clip: true,
    cornerRadius: 2,
    fill: "$color.surface",
    stroke: { align: "inside", thickness: 1, fill: "#FFFFFF0D" },
    layout: "none",
    children,
  };
}

function shell(id, name, x, w, cols, pad) {
  const gap = 20;
  const inner = w - pad * 2;
  const cardW = cols === 1 ? inner : Math.floor((inner - gap) / 2);
  const cards = CAST.map((_, i) => portraitCard(id, i, cardW));
  const cardH = cards[0].height;
  const rows = cols === 1 ? 4 : 2;
  const gridH = 8 + rows * cardH + (rows - 1) * gap + 32;
  const artboardH = 64 + gridH;
  const gridChildren =
    cols === 1
      ? cards
      : [
          {
            type: "frame",
            id: `${id}-r0`,
            layout: "horizontal",
            gap,
            children: [cards[0], cards[1]],
          },
          {
            type: "frame",
            id: `${id}-r1`,
            layout: "horizontal",
            gap,
            children: [cards[2], cards[3]],
          },
        ];

  return {
    id,
    name,
    type: "frame",
    x,
    y: 0,
    width: w,
    height: artboardH,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      {
        type: "frame",
        id: `${id}-top`,
        width: "fill_container",
        height: 64,
        layout: "horizontal",
        justifyContent: "space_between",
        alignItems: "center",
        padding: [16, pad],
        children: [
          icon(`${id}-close`, "close", { size: 24, fill: "#FFFFFF" }),
          text(`${id}-title`, "The Cast", {
            fontFamily: "Cinzel",
            fontSize: 14,
            fill: "$color.primary",
            letterSpacing: 3,
          }),
          { type: "frame", id: `${id}-spacer`, width: 24, height: 24 },
        ],
      },
      {
        type: "frame",
        id: `${id}-grid`,
        width: "fill_container",
        layout: "vertical",
        gap,
        padding: [8, pad, 32, pad],
        children: gridChildren,
      },
    ],
  };
}

writePen(path.join(__dirname, "the_cast_gallery.pen"), [
  shell("artboard-cast-mobile", "Cast Gallery — mobile", artboardX(0), MOBILE_W, 1, 24),
  shell("artboard-cast-tablet", "Cast Gallery — tablet 2-col", artboardX(1), TABLET_W, 2, 32),
]);
