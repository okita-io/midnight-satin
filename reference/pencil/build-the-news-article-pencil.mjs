#!/usr/bin/env node
/**
 * News article detail — mobile 390 + tablet 834 → the_news_article.pen
 * Source: live /updates/[slug] view + news-updates-system Requirement 6.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  TABLET_READ_COL,
  artboardX,
  backControl,
  bottomNav,
  decorativeRule,
  goldPill,
  icon,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const HERO =
  "https://images.unsplash.com/photo-1639484614066-26f158a81e6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3ODQyMzA1MzV8&ixlib=rb-4.1.0&q=80&w=1080";

const TITLE = "A Letter from the Editor: What Comes After Midnight";
const SUMMARY =
  "The next chapter of Midnight Satin brings new voices, deeper worlds, and more ways for readers to shape the stories they love.";
const PARAGRAPHS = [
  "When we opened the doors to Midnight Satin, we imagined a quiet room after dark: velvet chairs, candlelight, and a shelf of stories chosen for the readers who still believe anticipation is an art.",
  "That room is growing. Over the coming weeks, new authors will join the library with romances that move from rain-soaked London to gilded coastal estates. Each story remains built around the details that matter most—charged glances, impossible choices, and characters worth losing sleep over.",
  "We are also preparing more ways to take part beyond the page. Reader endorsements will shape weekly spotlights, limited campaigns will unlock special rewards, and The Gazette will continue to share the people and craft behind every release.",
];
const TAGS = ["Editor's Letter", "Inside Satin", "New Release"];

function tagPill(prefix, label, index) {
  return {
    type: "frame",
    id: `${prefix}-tag-${index}`,
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    padding: [6, 10],
    cornerRadius: 2,
    fill: "#121212CC",
    stroke: { align: "inside", thickness: 1, fill: "#D4AF3759" },
    children: [
      text(`${prefix}-tag-${index}-label`, label, {
        fontFamily: "Marcellus",
        fontSize: 9,
        fill: "$color.primary",
        letterSpacing: 1,
      }),
    ],
  };
}

function tagRow(prefix) {
  return {
    type: "frame",
    id: `${prefix}-tags`,
    layout: "horizontal",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    children: TAGS.map((tag, index) => tagPill(prefix, tag, index)),
  };
}

function hero(prefix, width, height, tablet = false) {
  const contentWidth = tablet ? TABLET_READ_COL : width - 48;
  return {
    type: "frame",
    id: `${prefix}-hero`,
    width: "fill_container",
    height,
    layout: "none",
    clip: true,
    children: [
      {
        type: "rectangle",
        id: `${prefix}-hero-image`,
        x: 0,
        y: 0,
        width,
        height,
        fill: { type: "image", url: HERO, mode: "fill", opacity: 0.76 },
      },
      {
        type: "rectangle",
        id: `${prefix}-hero-bottom-fade`,
        x: 0,
        y: 0,
        width,
        height,
        fill: {
          type: "gradient",
          gradientType: "linear",
          rotation: 0,
          colors: [
            { color: "#05050500", position: 0 },
            { color: "#05050566", position: 0.48 },
            { color: "#050505", position: 1 },
          ],
        },
      },
      {
        type: "rectangle",
        id: `${prefix}-hero-top-fade`,
        x: 0,
        y: 0,
        width,
        height,
        fill: {
          type: "gradient",
          gradientType: "linear",
          rotation: 180,
          colors: [
            { color: "#050505A6", position: 0 },
            { color: "#05050500", position: 0.38 },
          ],
        },
      },
      {
        type: "frame",
        id: `${prefix}-hero-copy`,
        x: Math.round((width - contentWidth) / 2),
        y: tablet ? 230 : 210,
        width: contentWidth,
        layout: "vertical",
        alignItems: "center",
        gap: 12,
        children: [
          text(`${prefix}-eyebrow`, "THE GAZETTE  ·  EDITORIAL", {
            fontFamily: "Cinzel",
            fontSize: 10,
            fill: "$color.primary",
            letterSpacing: 3,
            textAlign: "center",
            width: contentWidth,
          }),
          text(`${prefix}-title`, TITLE, {
            fontFamily: "Playfair Display",
            fontSize: tablet ? 40 : 30,
            fontStyle: "italic",
            fontWeight: "600",
            fill: "#FFFFFF",
            lineHeight: 1.1,
            textAlign: "center",
            width: contentWidth,
          }),
          {
            type: "frame",
            id: `${prefix}-attribution-row`,
            layout: "horizontal",
            gap: 8,
            alignItems: "center",
            justifyContent: "center",
            children: [
              text(`${prefix}-attribution`, "From the Editor", {
                fontFamily: "Marcellus",
                fontSize: 12,
                fill: "#FFFFFFCC",
                letterSpacing: 1,
              }),
              icon(`${prefix}-platform-icon`, "photo_camera", {
                size: 14,
                fill: "$color.primary",
              }),
              text(`${prefix}-platform`, "Instagram", {
                fontFamily: "Marcellus",
                fontSize: 11,
                fill: "$color.primary",
                letterSpacing: 1,
              }),
            ],
          },
          tagRow(prefix),
        ],
      },
    ],
  };
}

function articleBody(prefix, contentWidth, tablet = false) {
  return {
    type: "frame",
    id: `${prefix}-article`,
    width: contentWidth,
    layout: "vertical",
    gap: tablet ? 24 : 20,
    children: [
      backControl(`${prefix}-back`, "Back", { showLabel: true }),
      text(`${prefix}-summary`, SUMMARY, {
        fontFamily: "Literata",
        fontSize: tablet ? 20 : 17,
        fontStyle: "italic",
        fill: "$color.textMuted",
        lineHeight: 1.55,
        textAlign: "center",
        width: contentWidth,
      }),
      decorativeRule(`${prefix}-ornament`, { width: contentWidth }),
      text(`${prefix}-heading`, "The room beyond the page", {
        fontFamily: "Playfair Display",
        fontSize: tablet ? 28 : 23,
        fontStyle: "italic",
        fill: "$color.primary",
        width: contentWidth,
      }),
      ...PARAGRAPHS.map((paragraph, index) =>
        text(`${prefix}-paragraph-${index}`, paragraph, {
          fontFamily: "Literata",
          fontSize: tablet ? 18 : 16,
          fill: "#EAEAEAE6",
          lineHeight: 1.65,
          width: contentWidth,
        })
      ),
      {
        type: "frame",
        id: `${prefix}-quote`,
        width: contentWidth,
        layout: "horizontal",
        gap: 16,
        padding: [4, 0, 4, 16],
        stroke: {
          align: "inside",
          thickness: { left: 2 },
          fill: "#D4AF3766",
        },
        children: [
          text(
            `${prefix}-quote-text`,
            "Romance has always lived in the space between what is said and what is almost confessed.",
            {
              fontFamily: "Literata",
              fontSize: tablet ? 17 : 15,
              fontStyle: "italic",
              fill: "$color.textMuted",
              lineHeight: 1.55,
              width: contentWidth - 20,
            }
          ),
        ],
      },
      {
        type: "frame",
        id: `${prefix}-campaign`,
        width: contentWidth,
        layout: "vertical",
        gap: 10,
        alignItems: "center",
        padding: [12, 0, 0, 0],
        children: [
          text(`${prefix}-campaign-label`, "CAMPAIGN ARTICLE VARIANT", {
            fontFamily: "Cinzel",
            fontSize: 9,
            fill: "$color.textMuted",
            letterSpacing: 2,
          }),
          goldPill(`${prefix}-campaign-cta`, "Visit Campaign"),
        ],
      },
    ],
  };
}

function mobileArtboard() {
  const pad = 24;
  const contentWidth = MOBILE_W - pad * 2;
  return {
    id: "artboard-news-article-mobile",
    name: "News Article Detail — Mobile 390",
    type: "frame",
    x: artboardX(0),
    y: 0,
    width: MOBILE_W,
    height: 1600,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      hero("nam", MOBILE_W, 500),
      {
        type: "frame",
        id: "nam-scroll",
        width: "fill_container",
        height: "fill_container",
        layout: "vertical",
        alignItems: "center",
        padding: [24, pad, 32, pad],
        children: [articleBody("nam", contentWidth)],
      },
      bottomNav("nam", "updates"),
    ],
  };
}

function tabletArtboard() {
  const sidePad = Math.floor((TABLET_W - TABLET_READ_COL) / 2);
  return {
    id: "artboard-news-article-tablet",
    name: "News Article Detail — Tablet 834",
    context:
      "iPad portrait. Full-width article hero; centered 672px Literata reading column; Updates nav active.",
    type: "frame",
    x: artboardX(1),
    y: 0,
    width: TABLET_W,
    height: 1480,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      hero("nat", TABLET_W, 520, true),
      {
        type: "frame",
        id: "nat-scroll",
        width: "fill_container",
        height: "fill_container",
        layout: "vertical",
        alignItems: "center",
        padding: [32, sidePad, 40, sidePad],
        children: [articleBody("nat", TABLET_READ_COL, true)],
      },
      bottomNav("nat", "updates"),
    ],
  };
}

const outPath = path.join(__dirname, "the_news_article.pen");
writePen(outPath, [mobileArtboard(), tabletArtboard()]);
