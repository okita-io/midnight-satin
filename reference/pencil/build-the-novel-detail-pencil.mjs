#!/usr/bin/env node
/**
 * Novel Detail — mobile 390 + tablet 834 → the_novel_detail.pen
 * Sources: reference/the_novel_detail.html, the_novel_detail_tablet.html
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
  goldPill,
  icon,
  sectionHeaderRow,
  shellStroke,
  subsectionLabel,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HERO =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAZLFshGrt-9VzdgoLr_YSD6LQIfC_hDjB67E_sBkvBMI3pHTwDpEPLyT-gJo7BP_rtfgk_xnkxuuUPMnJ9FGzqaYKK3NgWowdAT1a32kz7B1ybc7db9pioswAapIFGhoqAk7pjaty9sAZZFSSpemNDh2VLzQpTGwXS8ggo6SLEzFXl0dht6ZWedDKltKmdD4flMhDqk_8CjXcoKESu7UpaXEdRgZV2kgPPO31O1yVVpkPverUUwaE0AaU91rUaemKSx7-6f26NKe8";
const COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3OsDyhnFqXzSJHKxU3VZLgnIZx6jvMhqJ2FHlA43Mgn74OXo5m5VKtoHeCvGEkRzvuhfunKedZMPeUb6AAwq0H-pCxJX1Z0uS14BwJD9oB-WfI5MIRb7nQUcrogEYUvoiuXBfC4hwKnM5OrbxSnYNmzlIZY51QtT0oGQMDntm7E1PLGh2POZV4wSwUwKmdCaBBAPnqjWQrFAU0W7KijPd0W5mDAj14bwUkG-E8HVPn6gpy0K1FdFBwzv8nUXLJVdQhRwB_ZfcIa0";
const PLAYER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB34Y59SvzxA3ZGoahQD_NH_QOje2VSfafbDZx6H5tFhGUMRnto93NRMqRDeIWkFqzedvCgAdk3gsyL1ilzhrGLLK2mmo723bjDyVN8fkuB4VGNyyQP725iqLPlmP_WjsByw3JOHovoyLVtN9JMmypRQHpc55w3Fnin4_mvox6RsUUZN7QNf_O05K5SXlyUJUHSqMYnD0-hxxlK49IcU6pFp4XB7alVtNmRImMFF-jpRcq0aOmjKnAmJNqkI3YlHXafufIi8QiTnZQ";

const PLAYERS = ["Alistair", "Rose", "Henry", "Dowager"];
const CHAPTERS = [
  { roman: "Chapter I", title: "The Midnight Ball", free: true },
  { roman: "Chapter II", title: "A Stolen Glance", free: true },
  { roman: "Chapter III", title: "Whispers in the Dark", free: false },
  { roman: "Chapter IV", title: "The Letter", free: false },
];

function topBar(prefix) {
  return {
    type: "frame",
    id: `${prefix}-top`,
    width: "fill_container",
    height: 56,
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    padding: [8, 16],
    children: [
      backControl(`${prefix}-back`, "Back", { fill: "#FFFFFF" }),
      {
        type: "frame",
        id: `${prefix}-top-right`,
        layout: "horizontal",
        gap: 12,
        children: [
          icon(`${prefix}-bm`, "bookmark", { size: 22, fill: "#FFFFFF" }),
          icon(`${prefix}-share`, "share", { size: 22, fill: "#FFFFFF" }),
        ],
      },
    ],
  };
}

function starRow(prefix) {
  return {
    type: "frame",
    id: `${prefix}-stars`,
    layout: "horizontal",
    gap: 4,
    alignItems: "center",
    children: [
      icon(`${prefix}-s1`, "star", { size: 18 }),
      icon(`${prefix}-s2`, "star", { size: 18 }),
      icon(`${prefix}-s3`, "star", { size: 18 }),
      icon(`${prefix}-s4`, "star", { size: 18 }),
      icon(`${prefix}-s5`, "star_half", { size: 18 }),
      text(`${prefix}-reviews`, "(4.8k reviews)", {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "#FFFFFFCC",
      }),
    ],
  };
}

function genreTags(prefix) {
  return {
    type: "frame",
    id: `${prefix}-tags`,
    layout: "horizontal",
    gap: 8,
    justifyContent: "center",
    children: ["Historical", "Spicy", "Slow Burn"].map((label, i) => ({
      type: "frame",
      id: `${prefix}-tag-${i}`,
      padding: [4, 12],
      cornerRadius: 2,
      fill: "#05050580",
      stroke: { align: "inside", thickness: 1, fill: "#D4AF3799" },
      children: [
        text(`${prefix}-tag-${i}-t`, label, {
          fontFamily: "Marcellus",
          fontSize: 10,
          fill: "$color.primary",
          letterSpacing: 1.5,
        }),
      ],
    })),
  };
}

function chapterRow(prefix, n, { roman, title, free }) {
  return {
    type: "frame",
    id: `${prefix}-ch-${n}`,
    width: "fill_container",
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    padding: [16, 0],
    stroke: { align: "inside", thickness: { bottom: 1 }, fill: "#FFFFFF0D" },
    children: [
      {
        type: "frame",
        id: `${prefix}-ch-${n}-copy`,
        layout: "vertical",
        gap: 4,
        width: "fill_container",
        children: [
          text(`${prefix}-ch-${n}-roman`, roman, {
            fontFamily: "Marcellus",
            fontSize: 10,
            fill: free ? "$color.primary" : "$color.textMuted",
            letterSpacing: 2,
            fontWeight: "700",
          }),
          text(`${prefix}-ch-${n}-title`, title, {
            fontFamily: "Playfair Display",
            fontSize: 16,
            fontStyle: "italic",
            fill: free ? "$color.textMain" : "$color.textMuted",
            width: 240,
          }),
        ],
      },
      free
        ? {
            type: "frame",
            id: `${prefix}-ch-${n}-meta`,
            layout: "horizontal",
            gap: 8,
            alignItems: "center",
            children: [
              text(`${prefix}-ch-${n}-b`, "Free", {
                fontFamily: "Marcellus",
                fontSize: 11,
                fill: "$color.textMuted",
              }),
              icon(`${prefix}-ch-${n}-chev`, "chevron_right", {
                size: 20,
                fill: "#FFFFFF55",
              }),
            ],
          }
        : icon(`${prefix}-ch-${n}-lock`, "lock", { size: 18 }),
    ],
  };
}

function playerChip(prefix, name) {
  return {
    type: "frame",
    id: `${prefix}-player-${name}`,
    layout: "vertical",
    gap: 8,
    alignItems: "center",
    width: 72,
    children: [
      {
        type: "ellipse",
        id: `${prefix}-player-${name}-av`,
        width: 64,
        height: 64,
        fill: { type: "image", url: PLAYER, mode: "fill" },
        stroke: { align: "inside", thickness: 2, fill: "#D4AF374D" },
      },
      text(`${prefix}-player-${name}-n`, name, {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.textMain",
        textAlign: "center",
        width: 72,
      }),
    ],
  };
}

function playersSection(prefix, names) {
  return {
    type: "frame",
    id: `${prefix}-players`,
    width: "fill_container",
    layout: "vertical",
    gap: 16,
    padding: [8, 24],
    children: [
      sectionHeaderRow(`${prefix}-players-h`, "The Players", { viewAll: true }),
      {
        type: "frame",
        id: `${prefix}-players-row`,
        layout: "horizontal",
        gap: 16,
        width: "fill_container",
        children: names.map((n) => playerChip(prefix, n)),
      },
    ],
  };
}

function contentsSection(prefix, chapters) {
  return {
    type: "frame",
    id: `${prefix}-chapters`,
    width: "fill_container",
    layout: "vertical",
    gap: 4,
    padding: [8, 24, 16, 24],
    children: [
      {
        type: "frame",
        id: `${prefix}-ch-head`,
        width: "fill_container",
        layout: "horizontal",
        justifyContent: "space_between",
        alignItems: "end",
        padding: [0, 0, 8, 0],
        children: [
          subsectionLabel(`${prefix}-ch-h`, "Contents", { withRule: true }),
          {
            type: "frame",
            id: `${prefix}-ch-counts`,
            layout: "horizontal",
            gap: 12,
            children: [
              text(`${prefix}-ch-free`, "5 Free Chapters", {
                fontFamily: "Marcellus",
                fontSize: 10,
                fill: "#D4AF3799",
                letterSpacing: 1.5,
              }),
              text(`${prefix}-ch-locked`, "20 Locked", {
                fontFamily: "Marcellus",
                fontSize: 10,
                fill: "#D4AF3799",
                letterSpacing: 1.5,
              }),
            ],
          },
        ],
      },
      ...chapters.map((c, i) => chapterRow(prefix, i + 1, c)),
    ],
  };
}

function mobileArtboard() {
  return {
    id: "artboard-novel-mobile",
    name: "Novel Detail — the_novel_detail.html",
    type: "frame",
    x: artboardX(0),
    y: 0,
    width: MOBILE_W,
    height: 1300,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      {
        type: "frame",
        id: "nm-hero",
        width: "fill_container",
        height: 520,
        layout: "none",
        clip: true,
        children: [
          {
            type: "rectangle",
            id: "nm-hero-img",
            x: 0,
            y: 0,
            width: MOBILE_W,
            height: 520,
            fill: { type: "image", url: HERO, mode: "fill" },
          },
          {
            type: "rectangle",
            id: "nm-hero-grad-b",
            x: 0,
            y: 0,
            width: MOBILE_W,
            height: 520,
            fill: {
              type: "gradient",
              gradientType: "linear",
              rotation: 180,
              colors: [
                { color: "#05050500", position: 0.2 },
                { color: "#05050599", position: 0.55 },
                { color: "#050505", position: 1 },
              ],
            },
          },
          {
            type: "rectangle",
            id: "nm-hero-grad-t",
            x: 0,
            y: 0,
            width: MOBILE_W,
            height: 120,
            fill: {
              type: "gradient",
              gradientType: "linear",
              rotation: 0,
              colors: [
                { color: "#05050599", position: 0 },
                { color: "#05050500", position: 1 },
              ],
            },
          },
          {
            ...topBar("nm"),
            x: 0,
            y: 0,
            width: MOBILE_W,
          },
          {
            type: "frame",
            id: "nm-hero-copy",
            x: 0,
            y: 200,
            width: MOBILE_W,
            layout: "vertical",
            gap: 10,
            padding: [0, 24, 28, 24],
            alignItems: "center",
            children: [
              text("nm-kicker", "Editor's Pick", {
                fontFamily: "Cinzel",
                fontSize: 10,
                fill: "#FFFFFF",
                letterSpacing: 3,
              }),
              text("nm-title", "The Duke's Secret", {
                fontFamily: "Playfair Display",
                fontSize: 34,
                fontStyle: "italic",
                fontWeight: "700",
                fill: "#FFFFFF",
                textAlign: "center",
                width: 340,
              }),
              text("nm-author", "By Elena Vane", {
                fontFamily: "Playfair Display",
                fontSize: 15,
                fill: "#FFFFFF",
              }),
              starRow("nm"),
              goldPill("nm-cta", "START READING"),
              genreTags("nm"),
            ],
          },
        ],
      },
      {
        type: "frame",
        id: "nm-synopsis",
        width: "fill_container",
        layout: "vertical",
        gap: 8,
        padding: [8, 24, 16, 24],
        children: [
          text(
            "nm-syn-b",
            "In the heart of London's foggy streets, a scandal brews that threatens to tear the aristocracy apart. Lady Rose never intended to fall for the one man she was forbidden to touch, but destiny has a cruel sense of humor.",
            {
              fontFamily: "Literata",
              fontSize: 15,
              lineHeight: 1.55,
              fill: "#EAEAEAE6",
              width: 342,
            }
          ),
          {
            type: "frame",
            id: "nm-read-more",
            layout: "horizontal",
            gap: 4,
            alignItems: "center",
            children: [
              text("nm-read-more-t", "Read More", {
                fontFamily: "Marcellus",
                fontSize: 12,
                fill: "$color.primary",
                letterSpacing: 2,
                fontWeight: "700",
              }),
              icon("nm-read-more-i", "expand_more", { size: 16 }),
            ],
          },
        ],
      },
      playersSection("nm", PLAYERS),
      contentsSection("nm", CHAPTERS),
      bottomNav("nm", "library"),
    ],
  };
}

function tabletArtboard() {
  return {
    id: "artboard-novel-tablet",
    name: "Novel Detail — the_novel_detail_tablet.html",
    type: "frame",
    context: "Two-column: cover+cta | synopsis+players+contents. Width 834.",
    x: artboardX(1),
    y: 0,
    width: TABLET_W,
    height: 1100,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      topBar("nt"),
      {
        type: "frame",
        id: "nt-grid",
        width: "fill_container",
        layout: "horizontal",
        gap: 32,
        padding: [16, 32, 24, 32],
        children: [
          {
            type: "frame",
            id: "nt-left",
            width: 360,
            layout: "vertical",
            gap: 20,
            children: [
              {
                type: "frame",
                id: "nt-cover-wrap",
                width: "fill_container",
                height: 480,
                layout: "none",
                clip: true,
                cornerRadius: 4,
                stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
                children: [
                  {
                    type: "rectangle",
                    id: "nt-cover",
                    x: 0,
                    y: 0,
                    width: 360,
                    height: 480,
                    fill: { type: "image", url: COVER, mode: "fill" },
                  },
                  {
                    type: "rectangle",
                    id: "nt-cover-grad",
                    x: 0,
                    y: 240,
                    width: 360,
                    height: 240,
                    fill: {
                      type: "gradient",
                      gradientType: "linear",
                      rotation: 0,
                      colors: [
                        { color: "#05050500", position: 0 },
                        { color: "#050505F5", position: 1 },
                      ],
                    },
                  },
                  {
                    type: "frame",
                    id: "nt-cover-meta",
                    x: 24,
                    y: 280,
                    width: 312,
                    layout: "vertical",
                    gap: 8,
                    alignItems: "center",
                    children: [
                      text("nt-kicker", "Editor's Pick", {
                        fontFamily: "Cinzel",
                        fontSize: 10,
                        fill: "#FFFFFF",
                        letterSpacing: 3,
                      }),
                      text("nt-title", "The Duke's Secret", {
                        fontFamily: "Playfair Display",
                        fontSize: 28,
                        fontStyle: "italic",
                        fontWeight: "700",
                        fill: "#FFFFFF",
                        textAlign: "center",
                        width: 312,
                      }),
                      text("nt-author", "By Elena Vane", {
                        fontFamily: "Playfair Display",
                        fontSize: 14,
                        fill: "#FFFFFF",
                      }),
                      starRow("nt"),
                      goldPill("nt-cta", "START READING"),
                    ],
                  },
                ],
              },
              genreTags("nt"),
            ],
          },
          {
            type: "frame",
            id: "nt-right",
            width: "fill_container",
            layout: "vertical",
            gap: 20,
            children: [
              text(
                "nt-syn-b",
                "In the heart of London's foggy streets, a scandal brews that threatens to tear the aristocracy apart. Lady Rose never intended to fall for the one man she was forbidden to touch, but destiny has a cruel sense of humor.",
                {
                  fontFamily: "Literata",
                  fontSize: 15,
                  lineHeight: 1.55,
                  width: TABLET_READ_COL - 360,
                }
              ),
              playersSection("nt", PLAYERS),
              contentsSection("nt", CHAPTERS),
            ],
          },
        ],
      },
      bottomNav("nt", "library"),
    ],
  };
}

writePen(path.join(__dirname, "the_novel_detail.pen"), [
  mobileArtboard(),
  tabletArtboard(),
]);
