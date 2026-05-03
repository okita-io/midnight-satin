#!/usr/bin/env node
/**
 * One-off generator: HTML reference → Pencil-compatible JSON.
 * Output: midnight_satin_home.pencil (same schema as .pen per docs.pencil.dev).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

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

const doc = {
  version: "2.10",
  variables: {
    "color.primary": { type: "color", value: "#D4AF37" },
    "color.void": { type: "color", value: "#050505" },
    "color.surface": { type: "color", value: "#121212" },
    "color.surfaceHighlight": { type: "color", value: "#1A1A1A" },
    "color.textMain": { type: "color", value: "#EAEAEA" },
    "color.textMuted": { type: "color", value: "#8A8A8A" },
    "color.accent": { type: "color", value: "#800020" },
    "color.navBg": { type: "color", value: "#080808" },
  },
  children: [
    {
      id: "artboard-boudoir-mobile",
      name: "The Boudoir — midnight_satin_home.html",
      type: "frame",
      context:
        "Converted from reference/midnight_satin_home.html as a Pencil layout test. " +
        "Mobile width 390pt; typography approximates Playfair / Cinzel / Literata / Marcellus. " +
        "If the Pencil extension only registers .pen, rename or duplicate with .pen.",
      x: 0,
      y: 0,
      width: 390,
      height: 1320,
      fill: "$color.void",
      layout: "vertical",
      clip: true,
      stroke: {
        align: "inside",
        thickness: { left: 1, right: 1, top: 0, bottom: 0 },
        fill: "#1A1A1A",
      },
      children: [
        heroSection(),
        currentAffairsSection(),
        highSocietySection(),
        vaultTeaserSection(),
        { id: "spacer-nav-pad", type: "frame", width: "fill_container", height: 24, fill: "#00000000", layout: "none" },
        bottomNav(),
      ],
    },
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
            type: "icon_font",
            iconFontFamily: "Material Symbols Outlined",
            iconFontName: "menu_book",
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
            type: "icon_font",
            iconFontFamily: "Material Symbols Outlined",
            iconFontName: "search",
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
                type: "icon_font",
                iconFontFamily: "Material Symbols Outlined",
                iconFontName: "notifications",
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
    type: "icon_font",
    iconFontFamily: "Material Symbols Outlined",
    iconFontName: "star",
    width: 18,
    height: 18,
    fill: filled ? "$color.primary" : "#D4AF3766",
    weight: filled ? 700 : 400,
  };
}

function starIconHalf() {
  return {
    id: "star-half",
    type: "icon_font",
    iconFontFamily: "Material Symbols Outlined",
    iconFontName: "star_half",
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
      {
        id: "row-current-header",
        type: "frame",
        layout: "horizontal",
        justifyContent: "space_between",
        alignItems: "center",
        width: "fill_container",
        children: [
          {
            id: "h-current",
            type: "text",
            content: "Current Affairs",
            fontFamily: "Cinzel",
            fontSize: 13,
            letterSpacing: 2,
            fill: "#FFFFFFE6",
            textGrowth: "auto",
          },
          {
            id: "btn-view-all",
            type: "text",
            content: "View All",
            fontFamily: "Marcellus",
            fontSize: 10,
            letterSpacing: 3,
            fill: "$color.primary",
            textGrowth: "auto",
          },
        ],
      },
      {
        id: "card-reading",
        type: "frame",
        width: "fill_container",
        layout: "horizontal",
        gap: 16,
        padding: 16,
        fill: "$color.surface",
        stroke: { align: "inside", thickness: 1, fill: "#FFFFFF0D" },
        cornerRadius: 2,
        children: [
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
                  {
                    id: "icon-play",
                    type: "icon_font",
                    iconFontFamily: "Material Symbols Outlined",
                    iconFontName: "play_circle",
                    width: 26,
                    height: 26,
                    fill: "$color.primary",
                  },
                ],
              },
            ],
          },
        ],
      },
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
          id: `${id}-cover-icon`,
          type: "icon_font",
          iconFontFamily: "Material Symbols Outlined",
          iconFontName: "auto_stories",
          x: 45,
          y: 72,
          width: 40,
          height: 40,
          fill: "#8A8A8A",
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
      {
        id: `${bid}-s`,
        type: "icon_font",
        iconFontFamily: "Material Symbols Outlined",
        iconFontName: "star",
        width: 12,
        height: 12,
        fill: "$color.primary",
        weight: 700,
      },
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
        layout: "horizontal",
        justifyContent: "space_between",
        alignItems: "center",
        children: [
          {
            id: "h-trending",
            type: "text",
            content: "High Society",
            fontFamily: "Cinzel",
            fontSize: 13,
            letterSpacing: 2,
            fill: "#FFFFFFE6",
            textGrowth: "auto",
          },
        ],
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
                type: "icon_font",
                iconFontFamily: "Material Symbols Outlined",
                iconFontName: "diamond",
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

function navItem(icon, label, active) {
  return {
    id: `nav-${label}`,
    type: "frame",
    layout: "vertical",
    gap: 6,
    alignItems: "center",
    width: "fill_container",
    children: [
      {
        id: `nav-${label}-icon`,
        type: "icon_font",
        iconFontFamily: "Material Symbols Outlined",
        iconFontName: icon,
        width: active ? 28 : 24,
        height: active ? 28 : 24,
        fill: active ? "$color.primary" : "$color.textMuted",
      },
      {
        id: `nav-${label}-txt`,
        type: "text",
        content: label,
        fontFamily: "Marcellus",
        fontSize: 10,
        fontWeight: "500",
        letterSpacing: 2,
        fill: active ? "$color.primary" : "$color.textMuted",
        textGrowth: "auto",
      },
    ],
  };
}

function bottomNav() {
  return {
    id: "bottom-nav",
    type: "frame",
    width: "fill_container",
    height: 96,
    fill: "$color.navBg",
    stroke: { align: "inside", thickness: { top: 1, left: 0, right: 0, bottom: 0 }, fill: "#1F1F1F" },
    padding: [16, 24, 28, 24],
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "end",
    children: [
      navItem("history_edu", "Boudoir", true),
      navItem("local_library", "Library", false),
      navItem("storefront", "Vault", false),
      navItem("person_3", "Profile", false),
    ],
  };
}

const out = path.join(__dirname, "midnight_satin_home.pencil");
fs.writeFileSync(out, JSON.stringify(doc, null, 2), "utf8");
console.log("Wrote", out);
