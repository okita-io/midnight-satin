#!/usr/bin/env node
/** Vault store — mobile + tablet → the_vault_store.pen */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  artboardX,
  bottomNav,
  goldPill,
  icon,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function pack(prefix, credits, price, featured) {
  const kids = [
    icon(`${prefix}-pack-${credits}-gem`, "diamond", {
      size: featured ? 32 : 24,
    }),
    text(`${prefix}-pack-${credits}-n`, `${credits}`, {
      fontFamily: "Playfair Display",
      fontSize: featured ? 28 : 22,
      fontWeight: "700",
      fill: "$color.primary",
    }),
    text(`${prefix}-pack-${credits}-l`, "CREDITS", {
      fontFamily: "Marcellus",
      fontSize: 10,
      letterSpacing: 2,
      fill: "$color.textMuted",
    }),
    text(`${prefix}-pack-${credits}-p`, price, {
      fontFamily: "Literata",
      fontSize: 14,
    }),
  ];
    if (featured) {
    kids.unshift({
      type: "frame",
      id: `${prefix}-pack-${credits}-badge`,
      height: 20,
      padding: [2, 10],
      cornerRadius: 2,
      fill: "$color.accent",
      layout: "horizontal",
      alignItems: "center",
      justifyContent: "center",
      children: [
        text(`${prefix}-pack-${credits}-badge-t`, "MOST POPULAR", {
          fontFamily: "Marcellus",
          fontSize: 9,
          fontWeight: "700",
          fill: "#FFFFFF",
          letterSpacing: 1.5,
        }),
      ],
    });
  }
  return {
    type: "frame",
    id: `${prefix}-pack-${credits}`,
    layout: "vertical",
    gap: 8,
    padding: featured ? [20, 16, 16, 16] : [16, 16],
    width: "fill_container",
    height: 180,
    cornerRadius: 2,
    fill: featured ? "#1A1500" : "$color.surface",
    stroke: {
      align: "inside",
      thickness: featured ? 2 : 1,
      fill: featured ? "$color.primary" : "#FFFFFF0D",
    },
    alignItems: "center",
    justifyContent: "center",
    children: kids,
  };
}

function vaultBody(prefix, cols) {
  const packs = [
    pack(prefix, "200", "$1.99", false),
    pack(prefix, "550", "$4.99", true),
    pack(prefix, "1200", "$9.99", false),
    pack(prefix, "2500", "$19.99", false),
  ];
  if (cols === 2) {
    return {
      type: "frame",
      id: `${prefix}-packs`,
      layout: "vertical",
      gap: 16,
      width: "fill_container",
      children: [
        {
          type: "frame",
          id: `${prefix}-r1`,
          layout: "horizontal",
          gap: 16,
          width: "fill_container",
          children: [packs[0], packs[1]],
        },
        {
          type: "frame",
          id: `${prefix}-r2`,
          layout: "horizontal",
          gap: 16,
          width: "fill_container",
          children: [packs[2], packs[3]],
        },
      ],
    };
  }
  return {
    type: "frame",
    id: `${prefix}-packs`,
    layout: "horizontal",
    gap: 16,
    width: "fill_container",
    children: packs,
  };
}

function artboard(id, name, x, w, cols, pad, height) {
  const cta = {
    ...goldPill(`${id}-cta`, "RESTORE PURCHASES"),
    width: "fill_container",
  };
  return {
    id,
    name,
    type: "frame",
    x,
    y: 0,
    width: w,
    height,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      {
        type: "frame",
        id: `${id}-head`,
        width: "fill_container",
        layout: "vertical",
        gap: 12,
        padding: [32, pad, 16, pad],
        alignItems: "center",
        children: [
          icon(`${id}-rule`, "diamond", { size: 28 }),
          text(`${id}-title`, "The Vault", {
            fontFamily: "Cinzel",
            fontSize: 18,
            fill: "$color.primary",
            letterSpacing: 4,
          }),
          text(`${id}-sub`, "Credits for chapters, roses, and more.", {
            fontFamily: "Literata",
            fontSize: 13,
            fill: "$color.textMuted",
            textAlign: "center",
            width: w - pad * 2,
          }),
          {
            type: "frame",
            id: `${id}-balance`,
            layout: "horizontal",
            gap: 8,
            padding: [10, 16],
            fill: "#1A1500",
            stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
            cornerRadius: 2,
            alignItems: "center",
            children: [
              icon(`${id}-bal-i`, "payments", { size: 16 }),
              text(`${id}-bal-t`, "Balance: 1,250", {
                fontFamily: "Marcellus",
                fontSize: 12,
                letterSpacing: 1,
              }),
            ],
          },
        ],
      },
      {
        type: "frame",
        id: `${id}-body`,
        width: "fill_container",
        height: "fill_container",
        padding: [8, pad, 24, pad],
        layout: "vertical",
        gap: 20,
        children: [vaultBody(id, cols), cta],
      },
      bottomNav(id, "vault"),
    ],
  };
}

writePen(path.join(__dirname, "the_vault_store.pen"), [
  artboard(
    "artboard-vault-mobile",
    "Vault — the_vault_store.html (mobile)",
    artboardX(0),
    MOBILE_W,
    2,
    24,
    844
  ),
  artboard(
    "artboard-vault-tablet",
    "Vault — tablet packs row",
    artboardX(1),
    TABLET_W,
    4,
    40,
    600
  ),
]);
