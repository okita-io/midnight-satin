#!/usr/bin/env node
/**
 * Midnight Satin — shared Pencil design system + slide templates.
 * Output: design_system.pen (Pencil JSON v2.11, same shape as midnight_satin_home.pen)
 *
 * Use when converting reference/*.html screens into Pencil: copy variables from this file
 * or open both documents and align fills/fonts to $color.* / font families below.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLIDE_W = 1920;
const SLIDE_H = 1080;
const SLIDE_GAP = 80;
const PAD = 100;

const variables = {
  "color.primary": { type: "color", value: "#D4AF37" },
  "color.void": { type: "color", value: "#050505" },
  "color.surface": { type: "color", value: "#121212" },
  "color.surfaceHighlight": { type: "color", value: "#1A1A1A" },
  "color.textMain": { type: "color", value: "#EAEAEA" },
  "color.textMuted": { type: "color", value: "#8A8A8A" },
  "color.accent": { type: "color", value: "#800020" },
  "color.navBg": { type: "color", value: "#080808" },
  "font.display": { type: "string", value: "Playfair Display" },
  "font.heading": { type: "string", value: "Cinzel" },
  "font.body": { type: "string", value: "Literata" },
  "font.ui": { type: "string", value: "Marcellus" },
  "radius.card": { type: "number", value: 2 },
  "space.screenPad": { type: "number", value: 24 },
  "space.sectionGap": { type: "number", value: 16 },
};

function slideX(index) {
  return index * (SLIDE_W + SLIDE_GAP);
}

function slideFrame(id, name, index, children) {
  return {
    type: "frame",
    id,
    name,
    x: slideX(index),
    y: 0,
    width: SLIDE_W,
    height: SLIDE_H,
    fill: "$color.void",
    layout: "none",
    clip: true,
    children,
  };
}

function swatchColumn(id, label, hex, fill) {
  return {
    type: "frame",
    id: `sw-wrap-${id}`,
    layout: "vertical",
    gap: 10,
    alignItems: "center",
    width: 160,
    children: [
      {
        type: "rectangle",
        id: `sw-rect-${id}`,
        width: 140,
        height: 140,
        cornerRadius: 8,
        fill,
        stroke: { align: "inside", fill: "#FFFFFF22", thickness: 1 },
      },
      {
        type: "text",
        id: `sw-label-${id}`,
        fill: "$color.textMain",
        content: label,
        fontFamily: "Marcellus",
        fontSize: 18,
        fontWeight: "500",
        textAlign: "center",
      },
      {
        type: "text",
        id: `sw-hex-${id}`,
        fill: "$color.textMuted",
        content: hex,
        fontFamily: "Literata",
        fontSize: 15,
        textAlign: "center",
      },
    ],
  };
}

function typeRow(id, role, family, size, weight, sample, notes) {
  return {
    type: "frame",
    id: `type-row-${id}`,
    layout: "vertical",
    gap: 12,
    width: "fill_container",
    children: [
      {
        type: "text",
        id: `type-role-${id}`,
        fill: "$color.primary",
        content: role.toUpperCase(),
        fontFamily: "Cinzel",
        fontSize: 12,
        fontWeight: "500",
        letterSpacing: 3,
      },
      {
        type: "text",
        id: `type-sample-${id}`,
        fill: "$color.textMain",
        content: sample,
        fontFamily: family,
        fontSize: size,
        fontWeight: weight,
        lineHeight: 1.15,
      },
      {
        type: "text",
        id: `type-meta-${id}`,
        fill: "$color.textMuted",
        content: notes,
        fontFamily: "Literata",
        fontSize: 20,
        lineHeight: 1.35,
      },
    ],
  };
}

const doc = {
  version: "2.11",
  children: [
    slideFrame("slide-ds-cover", "DS — Cover", 0, [
      {
        type: "frame",
        id: "slide-cover-stack",
        x: PAD,
        y: PAD,
        width: SLIDE_W - PAD * 2,
        height: SLIDE_H - PAD * 2,
        layout: "vertical",
        gap: 28,
        justifyContent: "center",
        alignItems: "start",
        children: [
          {
            type: "text",
            id: "cover-eyebrow",
            fill: "$color.primary",
            content: "REFERENCE · PENCIL",
            fontFamily: "Cinzel",
            fontSize: 14,
            fontWeight: "500",
            letterSpacing: 4,
          },
          {
            type: "text",
            id: "cover-title",
            fill: "$color.textMain",
            content: "Midnight Satin\nDesign System",
            fontFamily: "Playfair Display",
            fontSize: 72,
            fontWeight: "700",
            fontStyle: "italic",
            lineHeight: 1.08,
          },
          {
            type: "text",
            id: "cover-sub",
            fill: "$color.textMuted",
            content: "Tactile Noir Luxury — tokens, type, and slide shells for HTML → .pen conversion.",
            fontFamily: "Literata",
            fontSize: 28,
            lineHeight: 1.35,
          },
        ],
      },
    ]),

    slideFrame("slide-ds-colors", "DS — Color tokens", 1, [
      {
        type: "frame",
        id: "colors-head",
        x: PAD,
        y: PAD,
        width: SLIDE_W - PAD * 2,
        layout: "vertical",
        gap: 16,
        children: [
          {
            type: "text",
            id: "colors-title",
            fill: "$color.textMain",
            content: "Palette",
            fontFamily: "Playfair Display",
            fontSize: 48,
            fontWeight: "700",
          },
          {
            type: "text",
            id: "colors-sub",
            fill: "$color.textMuted",
            content: "Use $color.* variables in fills and strokes — match production Tailwind tokens.",
            fontFamily: "Literata",
            fontSize: 24,
            lineHeight: 1.35,
          },
        ],
      },
      {
        type: "frame",
        id: "colors-row",
        x: PAD,
        y: 260,
        width: SLIDE_W - PAD * 2,
        height: 420,
        layout: "horizontal",
        gap: 20,
        alignItems: "start",
        children: [
          swatchColumn("primary", "primary", "#D4AF37", "$color.primary"),
          swatchColumn("void", "void", "#050505", "$color.void"),
          swatchColumn("surface", "surface", "#121212", "$color.surface"),
          swatchColumn("surfaceHi", "surfaceHighlight", "#1A1A1A", "$color.surfaceHighlight"),
          swatchColumn("accent", "accent", "#800020", "$color.accent"),
          swatchColumn("textMain", "textMain", "#EAEAEA", "$color.textMain"),
          swatchColumn("textMuted", "textMuted", "#8A8A8A", "$color.textMuted"),
          swatchColumn("navBg", "navBg", "#080808", "$color.navBg"),
        ],
      },
    ]),

    slideFrame("slide-ds-typography", "DS — Typography", 2, [
      {
        type: "frame",
        id: "type-head",
        x: PAD,
        y: PAD,
        width: SLIDE_W - PAD * 2,
        layout: "vertical",
        gap: 12,
        children: [
          {
            type: "text",
            id: "type-title",
            fill: "$color.textMain",
            content: "Typography",
            fontFamily: "Playfair Display",
            fontSize: 48,
            fontWeight: "700",
          },
          {
            type: "text",
            id: "type-sub",
            fill: "$color.textMuted",
            content: "PRD: Display Playfair · Headings Cinzel · Body Literata · UI Marcellus",
            fontFamily: "Literata",
            fontSize: 22,
          },
        ],
      },
      {
        type: "frame",
        id: "type-stack",
        x: PAD,
        y: 220,
        width: SLIDE_W - PAD * 2,
        height: 780,
        layout: "vertical",
        gap: 36,
        children: [
          typeRow(
            "display",
            "Display (titles)",
            "Playfair Display",
            52,
            "700",
            "The Duke’s Forbidden Vow",
            "Italic allowed · high contrast on void"
          ),
          typeRow(
            "heading",
            "Headings (section rails)",
            "Cinzel",
            22,
            "500",
            "HIGH SOCIETY",
            "Uppercase · letter-spacing ~3–4px · app sizes often 10–13px on mobile"
          ),
          typeRow(
            "body",
            "Body (reading)",
            "Literata",
            26,
            "400",
            "She closed the ledger slowly, as if the ink might still be wet.",
            "Long-form ~18px in product; scaled up here for slide legibility"
          ),
          typeRow(
            "ui",
            "UI (buttons, labels)",
            "Marcellus",
            22,
            "400",
            "Continue reading",
            "~14px in UI chrome; tracking on micro-labels"
          ),
        ],
      },
    ]),

    slideFrame("slide-ds-mobile-shell", "DS — Mobile shell 390", 3, [
      {
        type: "frame",
        id: "mobile-annot",
        x: PAD,
        y: PAD,
        width: 520,
        layout: "vertical",
        gap: 20,
        children: [
          {
            type: "text",
            id: "mobile-title",
            fill: "$color.textMain",
            content: "Screen grid",
            fontFamily: "Playfair Display",
            fontSize: 44,
            fontWeight: "700",
          },
          {
            type: "text",
            id: "mobile-body",
            fill: "$color.textMuted",
            content:
              "Reference HTML is mobile-first at 390pt width.\n\nWhen converting a screen, start from this frame: void background, $space.screenPad horizontal padding on sections, $radius.card on cards.",
            fontFamily: "Literata",
            fontSize: 24,
            lineHeight: 1.45,
          },
        ],
      },
      {
        type: "frame",
        id: "mobile-chrome",
        x: 620,
        y: 120,
        width: 390,
        height: 900,
        fill: "$color.void",
        stroke: { align: "inside", fill: "$color.primary", thickness: 2 },
        layout: "vertical",
        clip: true,
        cornerRadius: 4,
        children: [
          {
            type: "frame",
            id: "mobile-chrome-header",
            width: "fill_container",
            height: 72,
            fill: "$color.surface",
            layout: "horizontal",
            padding: [16, 24],
            alignItems: "center",
            justifyContent: "center",
            children: [
              {
                type: "text",
                id: "mobile-chrome-brand",
                fill: "$color.primary",
                content: "Midnight Satin",
                fontFamily: "Cinzel",
                fontSize: 13,
                fontWeight: "500",
                letterSpacing: 3,
              },
            ],
          },
          {
            type: "frame",
            id: "mobile-chrome-body",
            width: "fill_container",
            height: "fill_container",
            fill: "$color.void",
            layout: "vertical",
            padding: [32, 24],
            gap: 16,
            children: [
              {
                type: "text",
                id: "mobile-chrome-h1",
                fill: "$color.textMain",
                content: "Placeholder artboard",
                fontFamily: "Playfair Display",
                fontSize: 28,
                fontWeight: "700",
                fontStyle: "italic",
              },
              {
                type: "text",
                id: "mobile-chrome-p",
                fill: "$color.textMuted",
                content: "Duplicate this slide or pull components from the library strip (x > 10k).",
                fontFamily: "Literata",
                fontSize: 16,
                lineHeight: 1.5,
              },
            ],
          },
        ],
      },
    ]),

    slideFrame("slide-ds-workflow", "DS — HTML → slides workflow", 4, [
      {
        type: "frame",
        id: "wf-col",
        x: PAD,
        y: PAD,
        width: SLIDE_W - PAD * 2,
        height: SLIDE_H - PAD * 2,
        layout: "vertical",
        gap: 28,
        children: [
          {
            type: "text",
            id: "wf-title",
            fill: "$color.textMain",
            content: "Conversion checklist",
            fontFamily: "Playfair Display",
            fontSize: 48,
            fontWeight: "700",
          },
          {
            type: "text",
            id: "wf-1",
            fill: "$color.textMain",
            content: "1. Copy variables from this file into each new screen .pen (or keep one library file open).",
            fontFamily: "Literata",
            fontSize: 26,
            lineHeight: 1.4,
          },
          {
            type: "text",
            id: "wf-2",
            fill: "$color.textMain",
            content: "2. One idea per slide (Pencil Slides guide): split dense HTML across multiple 1920×1080 frames.",
            fontFamily: "Literata",
            fontSize: 26,
            lineHeight: 1.4,
          },
          {
            type: "text",
            id: "wf-3",
            fill: "$color.textMain",
            content: "3. Replace ephemeral image URLs with repo assets under public/images/generated/ or reference/pencil/images/.",
            fontFamily: "Literata",
            fontSize: 26,
            lineHeight: 1.4,
          },
          {
            type: "text",
            id: "wf-4",
            fill: "$color.textMuted",
            content: "Regenerate: node reference/pencil/build-design-system-pencil.mjs",
            fontFamily: "Marcellus",
            fontSize: 22,
            letterSpacing: 1,
          },
        ],
      },
    ]),

    {
      type: "frame",
      id: "strip-ds-reusables",
      name: "DS — Reusable primitives",
      x: slideX(5),
      y: 0,
      width: 420,
      height: SLIDE_H,
      fill: "#0A0A0A",
      stroke: { align: "inside", fill: "#2A2A2A", thickness: { left: 1 } },
      layout: "vertical",
      gap: 32,
      padding: [PAD, 32],
      children: [
        {
          type: "text",
          id: "strip-title",
          fill: "$color.primary",
          content: "Components",
          fontFamily: "Cinzel",
          fontSize: 12,
          fontWeight: "500",
          letterSpacing: 3,
        },
        {
          type: "text",
          id: "strip-hint",
          fill: "$color.textMuted",
          content: "Insert instances via ref to these IDs from other .pen files in the same project.",
          fontFamily: "Literata",
          fontSize: 16,
          lineHeight: 1.45,
        },
        {
          type: "frame",
          id: "reuse-ms-section-label",
          name: "MS · Section label",
          reusable: true,
          width: "fill_container",
          layout: "horizontal",
          justifyContent: "space_between",
          alignItems: "center",
          padding: [0, 8],
          children: [
            {
              type: "text",
              id: "reuse-ms-section-label-text",
              fill: "$color.primary",
              content: "SECTION LABEL",
              fontFamily: "Cinzel",
              fontSize: 11,
              fontWeight: "500",
              letterSpacing: 4,
            },
            {
              type: "text",
              id: "reuse-ms-section-label-action",
              fill: "$color.textMuted",
              content: "View all →",
              fontFamily: "Marcellus",
              fontSize: 12,
              letterSpacing: 1,
            },
          ],
        },
        {
          type: "frame",
          id: "reuse-ms-card-chrome",
          name: "MS · Card chrome",
          reusable: true,
          width: "fill_container",
          height: 160,
          fill: "$color.surface",
          cornerRadius: 2,
          stroke: { align: "inside", fill: "#FFFFFF0D", thickness: 1 },
          padding: 16,
          layout: "vertical",
          gap: 12,
          justifyContent: "center",
          children: [
            {
              type: "text",
              id: "reuse-ms-card-chrome-title",
              fill: "$color.textMain",
              content: "Card title",
              fontFamily: "Playfair Display",
              fontSize: 18,
              fontWeight: "700",
            },
            {
              type: "text",
              id: "reuse-ms-card-chrome-meta",
              fill: "$color.textMuted",
              content: "Author · Marcellus 13px",
              fontFamily: "Marcellus",
              fontSize: 13,
            },
          ],
        },
        {
          type: "frame",
          id: "reuse-ms-gold-pill",
          name: "MS · Gold pill button",
          reusable: true,
          width: "fit_content",
          height: 44,
          fill: "$color.primary",
          cornerRadius: 2,
          padding: [12, 28],
          layout: "horizontal",
          alignItems: "center",
          justifyContent: "center",
          children: [
            {
              type: "text",
              id: "reuse-ms-gold-pill-label",
              fill: "$color.void",
              content: "Primary action",
              fontFamily: "Marcellus",
              fontSize: 14,
              fontWeight: "500",
              letterSpacing: 1,
            },
          ],
        },
      ],
    },
  ],
  variables,
};

const out = path.join(__dirname, "design_system.pen");
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
console.log("Wrote", out);
