#!/usr/bin/env node
/**
 * Generator: Boudoir (home) HTML reference → Pencil JSON.
 * Output: midnight_satin_home.pen (mobile 390 + tablet 834).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  VERSION,
  artboardX,
  bottomNav as sharedBottomNav,
  goldPill,
  hairlineStroke,
  icon,
  progressBar,
  sectionHeaderRow,
  shellStroke,
  surfaceCard,
  text,
  variables,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HERO_IMG =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB0FWAoY-qpFwIzQY_6NmtA-SM2ncwUiYZAEuYUEBom83LsxojIR6fgowWoE7PdG45wh2SSerECtQEUEHwxh6gRhXL-oNcyaZnuPwqItJdMvc-t7COhLSmV-06APiGC5HxJHdnezjXuFWJq0Fb5YZGjzyZ2qWd7Fq4ZLmiYLQK5LhcyaZl5pnP1XTbM51FlwZgCE5UOUSmdUXEkF48IbBGIejauxbuRCBVIt-yzfoiuyZK2WXMMIlJ2pnr6kn0_HXLqvqcwecc6uPg";
const COVER_CURRENT =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAWXl4paH8tw-7BvkMnhTPKLjxmH8nThGmIcJeuhJZPdKWjxlAWYmi7DyGcd_N69mMiQbQWRhAEEfrTzdg0ytX2spYJAfUvK078OxLP-FJc6Z-Va0c2GDJZokObdYp6apJxfZTlK3I1AjePZQ4kBh4PEVaFWCjwuhVIx86uIvZpPwEJ3AlnUzGm6iKE-z4IaiLpULC0-FB6UxQR9b8DNqQUHNoY4B_myjf3pILuGeYPCSzWmmH0vvDG_zsU8gekBdSPvpsal41NIU4";
const TREND1 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD-jy2ntZScXPc-EgaGAc38KBI_YhRUYl1mRN7RcxuAMIkJKii9F6LQVCyKNHjGMkG-bpoQHKVUgshJTcK7ahZLGBwx4-q33Y93lGSjfvWRqUOAY7lVcD7HlnrVjx2U_fOeB7BCQ50F9uXL6xQutaqSXbeCFakke4N5xVonnwcoNHlOLL25VqfbCQvEIUL0FU-cItwo0L9VDmlz6HoE9jYd8iT4eM7fGYnw-9FuYJW0T_JRCQAYNxCg-zHtXE9_kMGAtQ0Bpw3KjfM";
const TREND2 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ZMzPWHir-QvitLQbaWtq4dkFiPYU6TuxAkUlh8e7EMYfQCA7XGHEMxZ5kCmImqqWOoprsDJulEVGttbT5dft2cwYphTirdVBL94HfJ0wmaYZRRLv8VfS_pJ_wnuXW9RVHpyXkQz70b7yfeWSI-F_Bx_l041NwTTtKRAEkqWusrevXWjry40WUbYn_JUMwutYWxNCAmpWktj9wUfZeBxzQyDuY_ZoGn92IsqH_XNeiTWQPNweIcCVrfq2kcs2IBjk9Y_8h_BejII";
const TREND3 =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCY1pJAtpkQP521addbeH3ObF1aIwimoWU1DKFSD9KynOt_BOaB1S2m7uqIVRyb5AL0met6Ksqfu4FZnafL-cxBD6qjY4o14ty_pGBrHDuRO4Lov2i6I9nwy5NbNlT3Sb0Z0XPPrHOmPiu55QEn8xdsSKgGWRSG66m06bAJjx7x4kqvDJdvUC3QTpWrzhqiuG_-25bLbaD6dee6titau2aXK4weEE8FKdOJYuvZ8bKQLuFqEzCEhlM7TNoHI6QFNQPVD7GJVw9UTII";

function affairsRow(id, coverUrl, title, progress) {
  return surfaceCard(
    id,
    [
      {
        type: "rectangle",
        id: `${id}-cover`,
        width: 56,
        height: 80,
        cornerRadius: 2,
        fill: { type: "image", url: coverUrl, mode: "fill" },
      },
      {
        type: "frame",
        id: `${id}-meta`,
        layout: "vertical",
        gap: 6,
        width: "fill_container",
        children: [
          text(`${id}-title`, title, {
            fontFamily: "Playfair Display",
            fontSize: 14,
            fontStyle: "italic",
            fontWeight: "600",
            width: 180,
          }),
          progressBar(`${id}-track`, {
            fillWidth: Math.round(180 * progress),
          }),
        ],
      },
    ],
    {
      layout: "horizontal",
      gap: 12,
      padding: 12,
      fill: "#12121266",
      stroke: hairlineStroke(),
    }
  );
}

function trendCard(id, coverUrl, title, author, rating) {
  const coverChildren = [
    {
      type: "rectangle",
      id: `${id}-img`,
      x: 0,
      y: 0,
      width: 160,
      height: 240,
      fill: { type: "image", url: coverUrl, mode: "fill" },
    },
  ];
  if (rating) {
    coverChildren.push({
      type: "frame",
      id: `${id}-badge`,
      x: 108,
      y: 8,
      height: 22,
      fill: "#050505CC",
      stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
      cornerRadius: 2,
      layout: "horizontal",
      gap: 4,
      padding: [2, 6],
      alignItems: "center",
      children: [
        icon(`${id}-badge-s`, "star", { size: 12, weight: 700 }),
        text(`${id}-badge-t`, rating, {
          fontFamily: "Marcellus",
          fontSize: 10,
          fill: "#FFFFFF",
        }),
      ],
    });
  }
  return {
    type: "frame",
    id,
    layout: "vertical",
    gap: 8,
    width: 160,
    children: [
      {
        type: "frame",
        id: `${id}-cover`,
        width: 160,
        height: 240,
        clip: true,
        cornerRadius: 2,
        layout: "none",
        stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
        children: coverChildren,
      },
      text(`${id}-t`, title, {
        fontFamily: "Playfair Display",
        fontSize: 14,
        fontStyle: "italic",
        fontWeight: "700",
        width: 160,
      }),
      text(`${id}-a`, author, {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.textMuted",
        width: 160,
      }),
    ],
  };
}

function boudoirTabletArtboard() {
  return {
    id: "artboard-boudoir-tablet",
    name: "The Boudoir — midnight_satin_home_tablet.html",
    type: "frame",
    context:
      "Tablet 834pt (iPad portrait). Hero 8-col + Current Affairs 4-col, High Society row, vault teaser, bottom nav.",
    x: artboardX(1),
    y: 0,
    width: TABLET_W,
    height: 1220,
    fill: "$color.void",
    layout: "vertical",
    clip: true,
    stroke: shellStroke(),
    children: [
      {
        type: "frame",
        id: "t-header",
        width: "fill_container",
        height: 72,
        layout: "horizontal",
        justifyContent: "space_between",
        alignItems: "center",
        padding: [24, 40],
        children: [
          {
            type: "frame",
            id: "t-brand",
            layout: "horizontal",
            gap: 12,
            alignItems: "center",
            children: [
              icon("t-brand-icon", "menu_book", { size: 28 }),
              text("t-brand-label", "Midnight Satin", {
                fontFamily: "Cinzel",
                fontSize: 16,
                fill: "$color.primary",
                letterSpacing: 4,
              }),
            ],
          },
          {
            type: "frame",
            id: "t-header-actions",
            layout: "horizontal",
            gap: 20,
            alignItems: "center",
            children: [
              {
                type: "frame",
                id: "t-credits",
                layout: "horizontal",
                gap: 8,
                padding: [8, 14],
                fill: "#1A1500",
                stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
                cornerRadius: 2,
                alignItems: "center",
                children: [
                  icon("t-credits-icon", "payments", { size: 16 }),
                  text("t-credits-txt", "1,250 CREDITS", {
                    fontFamily: "Marcellus",
                    fontSize: 12,
                    letterSpacing: 2,
                  }),
                ],
              },
              icon("t-search", "search", { size: 24, fill: "#FFFFFFCC" }),
              icon("t-bell", "notifications", { size: 24, fill: "#FFFFFFCC" }),
            ],
          },
        ],
      },
      {
        type: "frame",
        id: "t-main",
        width: "fill_container",
        layout: "vertical",
        gap: 32,
        padding: [16, 40, 24, 40],
        children: [
          {
            type: "frame",
            id: "t-hero-row",
            width: "fill_container",
            height: 480,
            layout: "horizontal",
            gap: 24,
            children: [
              {
                type: "frame",
                id: "t-hero",
                width: 520,
                height: 480,
                layout: "none",
                clip: true,
                cornerRadius: 2,
                children: [
                  {
                    type: "rectangle",
                    id: "t-hero-img",
                    x: 0,
                    y: 0,
                    width: 520,
                    height: 480,
                    fill: { type: "image", url: HERO_IMG, mode: "fill", opacity: 0.7 },
                  },
                  {
                    type: "rectangle",
                    id: "t-hero-grad",
                    x: 0,
                    y: 0,
                    width: 520,
                    height: 480,
                    fill: {
                      type: "gradient",
                      gradientType: "linear",
                      rotation: 0,
                      colors: [
                        { color: "#05050500", position: 0 },
                        { color: "#050505F2", position: 1 },
                      ],
                    },
                  },
                  {
                    type: "frame",
                    id: "t-hero-copy",
                    x: 40,
                    y: 200,
                    width: 440,
                    layout: "vertical",
                    gap: 12,
                    alignItems: "center",
                    children: [
                      text("t-hero-eyebrow", "Editor's Choice", {
                        fontFamily: "Cinzel",
                        fontSize: 10,
                        letterSpacing: 3,
                        fill: "#FFFFFF",
                      }),
                      text("t-hero-title", "The Duke's Forbidden Vow", {
                        fontFamily: "Playfair Display",
                        fontSize: 40,
                        fontStyle: "italic",
                        fontWeight: "700",
                        fill: "#FFFFFF",
                        textAlign: "center",
                        width: 440,
                      }),
                      text("t-hero-author", "By Eleanor Vane", {
                        fontFamily: "Marcellus",
                        fontSize: 13,
                        fill: "#FFFFFF",
                      }),
                      goldPill("t-hero-cta", "START READING"),
                    ],
                  },
                ],
              },
              {
                type: "frame",
                id: "t-affairs",
                width: "fill_container",
                height: 480,
                layout: "vertical",
                gap: 16,
                children: [
                  {
                    type: "frame",
                    id: "t-affairs-head",
                    width: "fill_container",
                    layout: "horizontal",
                    justifyContent: "space_between",
                    alignItems: "center",
                    children: [
                      text("t-affairs-title", "Current Affairs", {
                        fontFamily: "Cinzel",
                        fontSize: 14,
                        fill: "$color.primary",
                        letterSpacing: 3,
                      }),
                      text("t-affairs-all", "VIEW ALL", {
                        fontFamily: "Marcellus",
                        fontSize: 10,
                        fill: "$color.primary",
                        letterSpacing: 2,
                      }),
                    ],
                  },
                  affairsRow("t-aff-1", COVER_CURRENT, "Shadows of Desire", 0.65),
                  affairsRow("t-aff-2", TREND1, "Gilded Captive", 0.3),
                  affairsRow("t-aff-3", TREND2, "Night Court", 0.85),
                ],
              },
            ],
          },
          {
            type: "frame",
            id: "t-society-head",
            width: "fill_container",
            layout: "horizontal",
            justifyContent: "space_between",
            children: [
              text("t-society-title", "High Society", {
                fontFamily: "Cinzel",
                fontSize: 14,
                fill: "$color.primary",
                letterSpacing: 3,
              }),
              text("t-society-all", "VIEW ALL", {
                fontFamily: "Marcellus",
                fontSize: 10,
                fill: "$color.primary",
                letterSpacing: 2,
              }),
            ],
          },
          {
            type: "frame",
            id: "t-society-row",
            width: "fill_container",
            layout: "horizontal",
            gap: 20,
            children: [
              trendCard("t-tr-1", TREND1, "Gilded Captive", "Seraphina Thorne", "4.9"),
              trendCard("t-tr-2", TREND2, "Night Court", "Julian Vance", "4.8"),
              trendCard("t-tr-3", TREND3, "Silk & Scandal", "Elena Rose", "4.7"),
              trendCard("t-tr-4", COVER_CURRENT, "Shadows of Desire", "Marcus Hale", null),
            ],
          },
          {
            type: "frame",
            id: "t-vault",
            width: "fill_container",
            layout: "horizontal",
            justifyContent: "space_between",
            alignItems: "center",
            padding: 20,
            cornerRadius: 2,
            fill: {
              type: "gradient",
              gradientType: "linear",
              rotation: 270,
              colors: [
                { color: "#1A1500", position: 0 },
                { color: "#121212", position: 1 },
              ],
            },
            stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
            children: [
              {
                type: "frame",
                id: "t-vault-copy",
                layout: "vertical",
                gap: 6,
                children: [
                  text("t-vault-h", "The Vault", {
                    fontFamily: "Cinzel",
                    fontSize: 14,
                    fill: "$color.primary",
                    letterSpacing: 2,
                  }),
                  text("t-vault-p", "Unlock chapters and send roses with credits.", {
                    fontFamily: "Literata",
                    fontSize: 13,
                    fill: "$color.textMuted",
                    width: 420,
                  }),
                ],
              },
              icon("t-vault-gem", "diamond", { size: 32 }),
            ],
          },
        ],
      },
      { type: "frame", id: "t-nav-spacer", width: "fill_container", height: 16, fill: "#00000000" },
      sharedBottomNav("t", "home"),
    ],
  };
}

const doc = {
  version: VERSION,
  variables,
  children: [
    {
      id: "artboard-boudoir-mobile",
      name: "The Boudoir — midnight_satin_home.html",
      type: "frame",
      context:
        "Converted from reference/midnight_satin_home.html. Mobile width 390pt.",
      x: 0,
      y: 0,
      width: MOBILE_W,
      height: 1320,
      fill: "$color.void",
      layout: "vertical",
      clip: true,
      stroke: shellStroke(),
      children: [
        heroSection(),
        currentAffairsSection(),
        highSocietySection(),
        vaultTeaserSection(),
        { id: "spacer-nav-pad", type: "frame", width: "fill_container", height: 24, fill: "#00000000", layout: "none" },
        sharedBottomNav("m", "home"),
      ],
    },
    boudoirTabletArtboard(),
  ],
};

function heroSection() {
  return {
    id: "section-hero",
    type: "frame",
    width: "fill_container",
    height: 480,
    layout: "none",
    clip: true,
    children: [
      {
        id: "hero-bg-image",
        type: "rectangle",
        x: 0,
        y: 0,
        width: 390,
        height: 480,
        fill: {
          type: "image",
          url: HERO_IMG,
          mode: "fill",
          opacity: 0.6,
        },
      },
      {
        id: "hero-grad-bottom",
        type: "rectangle",
        x: 0,
        y: 0,
        width: 390,
        height: 480,
        fill: {
          type: "gradient",
          gradientType: "linear",
          rotation: 0,
          colors: [
            { color: "#05050500", position: 0 },
            { color: "#05050566", position: 0.45 },
            { color: "#050505", position: 1 },
          ],
        },
      },
      {
        id: "hero-grad-top",
        type: "rectangle",
        x: 0,
        y: 0,
        width: 390,
        height: 480,
        fill: {
          type: "gradient",
          gradientType: "linear",
          rotation: 180,
          colors: [
            { color: "#05050599", position: 0 },
            { color: "#05050500", position: 0.35 },
          ],
        },
      },
      {
        id: "hero-gold-sheen",
        type: "rectangle",
        x: 0,
        y: 0,
        width: 390,
        height: 480,
        fill: {
          type: "gradient",
          gradientType: "linear",
          rotation: 45,
          opacity: 0.12,
          colors: [
            { color: "#D4AF371A", position: 0 },
            { color: "#D4AF3700", position: 0.6 },
          ],
        },
      },
      headerRow(),
      heroCopyBlock(),
    ],
  };
}

function headerRow() {
  return {
    id: "header-overlay",
    type: "frame",
    x: 0,
    y: 0,
    width: 390,
    height: 72,
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    padding: [16, 24],
    fill: {
      type: "gradient",
      gradientType: "linear",
      rotation: 180,
      colors: [
        { color: "#000000CC", position: 0 },
        { color: "#00000000", position: 1 },
      ],
    },
    children: [
      {
        id: "header-brand",
        type: "frame",
        layout: "horizontal",
        gap: 8,
        alignItems: "center",
        children: [
          {
            id: "icon-menu-book",
            type: "icon",
            library: "Material Symbols Outlined",
            icon: "menu_book",
            width: 22,
            height: 22,
            fill: "$color.primary",
          },
          {
            id: "text-brand",
            type: "text",
            content: "Midnight Satin",
            fontFamily: "Cinzel",
            fontSize: 13,
            fontWeight: "500",
            letterSpacing: 3,
            fill: "$color.primary",
            textGrowth: "auto",
          },
        ],
      },
      {
        id: "header-actions",
        type: "frame",
        layout: "horizontal",
        gap: 16,
        alignItems: "center",
        children: [
          {
            id: "icon-search",
            type: "icon",
            library: "Material Symbols Outlined",
            icon: "search",
            width: 24,
            height: 24,
            fill: "#FFFFFFCC",
          },
          {
            id: "wrap-notify",
            type: "frame",
            layout: "none",
            width: 28,
            height: 28,
            children: [
              {
                id: "icon-notify",
                type: "icon",
                library: "Material Symbols Outlined",
                icon: "notifications",
                x: 0,
                y: 0,
                width: 24,
                height: 24,
                fill: "#FFFFFFCC",
              },
              {
                id: "notify-dot",
                type: "ellipse",
                x: 14,
                y: 2,
                width: 8,
                height: 8,
                fill: "$color.accent",
                stroke: { align: "outside", thickness: 1, fill: "$color.void" },
              },
            ],
          },
        ],
      },
    ],
  };
}

function heroCopyBlock() {
  return {
    id: "hero-copy",
    type: "frame",
    x: 0,
    y: 268,
    width: 390,
    height: 200,
    layout: "vertical",
    justifyContent: "end",
    alignItems: "center",
    gap: 6,
    padding: [0, 24, 36, 24],
    children: [
      {
        id: "hero-kicker",
        type: "text",
        content: "Editor's Choice",
        fontFamily: "Cinzel",
        fontSize: 10,
        letterSpacing: 3,
        fill: "#FFFFFF",
        textAlign: "center",
        textGrowth: "auto",
      },
      {
        id: "hero-title",
        type: "text",
        content: "The Duke’s\nForbidden Vow",
        fontFamily: "Playfair Display",
        fontSize: 34,
        fontStyle: "italic",
        fontWeight: "700",
        lineHeight: 1.1,
        fill: "#FFFFFF",
        textAlign: "center",
        textGrowth: "auto",
      },
      {
        id: "hero-byline",
        type: "text",
        content: "By Eleanor Vane",
        fontFamily: "Marcellus",
        fontSize: 13,
        letterSpacing: 1,
        fill: "#FFFFFF",
        textAlign: "center",
        textGrowth: "auto",
      },
      {
        id: "hero-stars-row",
        type: "frame",
        layout: "horizontal",
        gap: 8,
        alignItems: "center",
        children: [
          {
            id: "hero-stars-icons",
            type: "frame",
            layout: "horizontal",
            gap: 2,
            alignItems: "center",
            children: [
              starIcon("star-a", true),
              starIcon("star-b", true),
              starIcon("star-c", true),
              starIcon("star-d", true),
              starIconHalf(),
            ],
          },
          {
            id: "hero-reviews",
            type: "text",
            content: "(4.8k reviews)",
            fontFamily: "Literata",
            fontSize: 11,
            fill: "#FFFFFFCC",
            textGrowth: "auto",
          },
        ],
      },
      {
        id: "hero-cta",
        type: "frame",
        fill: "$color.primary",
        cornerRadius: 2,
        padding: [12, 32],
        layout: "vertical",
        alignItems: "center",
        children: [
          {
            id: "hero-cta-label",
            type: "text",
            content: "Start Reading",
            fontFamily: "Marcellus",
            fontSize: 13,
            fontWeight: "700",
            letterSpacing: 2,
            fill: "$color.void",
            textGrowth: "auto",
          },
        ],
      },
      genreTagsRow(),
    ],
  };
}

function starIcon(id, filled) {
  return {
    id,
    type: "icon",
    library: "Material Symbols Outlined",
    icon: "star",
    width: 18,
    height: 18,
    fill: filled ? "$color.primary" : "#D4AF3766",
    weight: filled ? 700 : 400,
  };
}

function starIconHalf() {
  return {
    id: "star-half",
    type: "icon",
    library: "Material Symbols Outlined",
    icon: "star_half",
    width: 18,
    height: 18,
    fill: "$color.primary",
    weight: 700,
  };
}

function genreTagsRow() {
  const tags = ["Historical", "Spicy", "Slow Burn"];
  return {
    id: "hero-tags",
    type: "frame",
    layout: "horizontal",
    gap: 8,
    justifyContent: "center",
    padding: [8, 0, 0, 0],
    children: tags.map((t, i) => ({
      id: `tag-${i}`,
      type: "frame",
      stroke: { align: "inside", thickness: 1, fill: "#D4AF3799" },
      cornerRadius: 2,
      padding: [6, 12],
      fill: "#05050580",
      layout: "vertical",
      alignItems: "center",
      children: [
        {
          id: `tag-txt-${i}`,
          type: "text",
          content: t,
          fontFamily: "Marcellus",
          fontSize: 10,
          letterSpacing: 2,
          fill: "$color.primary",
          textGrowth: "auto",
        },
      ],
    })),
  };
}

function currentAffairsSection() {
  return {
    id: "section-current",
    type: "frame",
    width: "fill_container",
    layout: "vertical",
    gap: 16,
    padding: [0, 24, 32, 24],
    fill: "#00000000",
    children: [
      sectionHeaderRow("row-current-header", "Current Affairs"),
      surfaceCard(
        "card-reading",
        [
          {
            id: "cover-wrap",
            type: "frame",
            width: 80,
            height: 120,
            clip: true,
            cornerRadius: 2,
            layout: "none",
            children: [
              {
                id: "cover-img",
                type: "rectangle",
                x: 0,
                y: 0,
                width: 80,
                height: 120,
                fill: { type: "image", url: COVER_CURRENT, mode: "fill" },
              },
              {
                id: "cover-progress-bg",
                type: "rectangle",
                x: 0,
                y: 116,
                width: 80,
                height: 4,
                fill: "#FFFFFF33",
              },
              {
                id: "cover-progress-fill",
                type: "rectangle",
                x: 0,
                y: 116,
                width: 52,
                height: 4,
                fill: "$color.primary",
              },
            ],
          },
          {
            id: "card-reading-meta",
            type: "frame",
            layout: "vertical",
            width: "fill_container",
            gap: 4,
            justifyContent: "center",
            children: [
              {
                id: "cr-chapter",
                type: "text",
                content: "Chapter IV",
                fontFamily: "Marcellus",
                fontSize: 10,
                letterSpacing: 2,
                fill: "#D4AF37CC",
                textGrowth: "auto",
              },
              {
                id: "cr-title",
                type: "text",
                content: "Velvet & Steel",
                fontFamily: "Playfair Display",
                fontSize: 20,
                fontWeight: "700",
                fontStyle: "italic",
                fill: "#FFFFFF",
                textGrowth: "fixed-width",
                width: 220,
              },
              {
                id: "cr-author",
                type: "text",
                content: "Lady Margaret Thorne",
                fontFamily: "Marcellus",
                fontSize: 11,
                fill: "$color.textMuted",
                textGrowth: "auto",
              },
              {
                id: "cr-footer",
                type: "frame",
                layout: "horizontal",
                justifyContent: "space_between",
                alignItems: "center",
                width: "fill_container",
                padding: [12, 0, 0, 0],
                children: [
                  {
                    id: "cr-pct",
                    type: "text",
                    content: "65% Complete",
                    fontFamily: "Marcellus",
                    fontSize: 10,
                    fill: "$color.textMuted",
                    textGrowth: "auto",
                  },
                  icon("icon-play", "play_circle", { size: 26 }),
                ],
              },
            ],
          },
        ],
        { layout: "horizontal", gap: 16, padding: 16 }
      ),
    ],
  };
}

function bookColumn(id, imgUrl, title, author, rating) {
  const coverChildren = imgUrl
    ? [
        {
          id: `${id}-cover-img`,
          type: "rectangle",
          x: 0,
          y: 0,
          width: 130,
          height: 195,
          fill: { type: "image", url: imgUrl, mode: "fill" },
        },
      ]
    : [
        {
          id: `${id}-cover-ph`,
          type: "rectangle",
          x: 0,
          y: 0,
          width: 130,
          height: 195,
          fill: "$color.surfaceHighlight",
        },
        {
          ...icon(`${id}-cover-icon`, "auto_stories", { size: 40, fill: "#8A8A8A" }),
          x: 45,
          y: 72,
          opacity: 0.45,
        },
      ];

  if (rating) {
    coverChildren.push(ratingBadge(rating, `${id}-badge`));
  }

  return {
    id,
    type: "frame",
    width: 130,
    layout: "vertical",
    gap: 10,
    children: [
      {
        id: `${id}-cover`,
        type: "frame",
        width: 130,
        height: 195,
        clip: true,
        cornerRadius: 2,
        layout: "none",
        stroke: { align: "inside", thickness: 1, fill: "#FFFFFF0D" },
        children: coverChildren,
      },
      {
        id: `${id}-title`,
        type: "text",
        content: title,
        fontFamily: "Playfair Display",
        fontSize: 16,
        fontWeight: "700",
        fontStyle: "italic",
        fill: "#FFFFFF",
        textGrowth: "fixed-width",
        width: 130,
      },
      {
        id: `${id}-author`,
        type: "text",
        content: author,
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.textMuted",
        textGrowth: "fixed-width",
        width: 130,
      },
    ],
  };
}

function ratingBadge(text, bid) {
  return {
    id: bid,
    type: "frame",
    x: 78,
    y: 8,
    width: 44,
    height: 22,
    fill: "#050505CC",
    stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
    cornerRadius: 2,
    layout: "horizontal",
    gap: 4,
    padding: [2, 6],
    alignItems: "center",
    children: [
      icon(`${bid}-s`, "star", { size: 12, weight: 700 }),
      {
        id: `${bid}-t`,
        type: "text",
        content: text,
        fontFamily: "Marcellus",
        fontSize: 10,
        fill: "#FFFFFF",
        textGrowth: "auto",
      },
    ],
  };
}

function highSocietySection() {
  return {
    id: "section-trending",
    type: "frame",
    width: "fill_container",
    layout: "vertical",
    gap: 16,
    padding: [0, 0, 24, 0],
    children: [
      {
        id: "trending-head-wrap",
        type: "frame",
        width: "fill_container",
        padding: [0, 24, 0, 24],
        children: [sectionHeaderRow("row-trending-header", "High Society", { viewAll: false })],
      },
      {
        id: "trending-row",
        type: "frame",
        layout: "horizontal",
        gap: 20,
        padding: [0, 24, 0, 24],
        width: "fill_container",
        children: [
          bookColumn("t1", TREND1, "Midnight Masquerade", "Viscount Blackwood", "4.9"),
          bookColumn("t2", TREND2, "The Scarlet Letter", "Nathaniel H.", null),
          bookColumn("t3", TREND3, "Bound by Silk", "Eliza Montrose", "4.7"),
          bookColumn("t4", null, "Coming Soon", "Unknown Author", null),
        ],
      },
    ],
  };
}

function vaultTeaserSection() {
  return {
    id: "section-vault",
    type: "frame",
    width: "fill_container",
    padding: [0, 24, 24, 24],
    children: [
      {
        id: "vault-card",
        type: "frame",
        width: "fill_container",
        layout: "horizontal",
        justifyContent: "space_between",
        alignItems: "center",
        padding: [20, 20],
        cornerRadius: 2,
        stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
        fill: {
          type: "gradient",
          gradientType: "linear",
          rotation: 0,
          colors: [
            { color: "#1a1500", position: 0 },
            { color: "#121212", position: 1 },
          ],
        },
        children: [
          {
            id: "vault-copy",
            type: "frame",
            layout: "vertical",
            gap: 6,
            width: "fill_container",
            children: [
              {
                id: "vault-h",
                type: "text",
                content: "Refill your purse",
                fontFamily: "Playfair Display",
                fontSize: 18,
                fontStyle: "italic",
                fill: "$color.primary",
                textGrowth: "auto",
              },
              {
                id: "vault-p",
                type: "text",
                content: "Unlock exclusive chapters and endorse your favorite suitors.",
                fontFamily: "Marcellus",
                fontSize: 11,
                fill: "$color.textMuted",
                textGrowth: "fixed-width",
                width: 200,
              },
            ],
          },
          {
            id: "vault-icon-wrap",
            type: "frame",
            width: 48,
            height: 48,
            cornerRadius: 999,
            fill: "#D4AF371A",
            stroke: { align: "inside", thickness: 1, fill: "#D4AF374D" },
            layout: "vertical",
            alignItems: "center",
            justifyContent: "center",
            children: [
              {
                id: "vault-diamond",
                type: "icon",
                library: "Material Symbols Outlined",
                icon: "diamond",
                width: 26,
                height: 26,
                fill: "$color.primary",
              },
            ],
          },
        ],
      },
    ],
  };
}


const out = path.join(__dirname, "midnight_satin_home.pen");
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
console.log("Wrote", out);
