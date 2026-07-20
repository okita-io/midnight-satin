#!/usr/bin/env node
/** Library catalog — mobile 390 (2-col) + tablet 834 (3-col) → the_library.pen */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  artboardX,
  bottomNav,
  icon,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const COVERS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAWXl4paH8tw-7BvkMnhTPKLjxmH8nThGmIcJeuhJZPdKWjxlAWYmi7DyGcd_N69mMiQbQWRhAEEfrTzdg0ytX2spYJAfUvK078OxLP-FJc6Z-Va0c2GDJZokObdYp6apJxfZTlK3I1AjePZQ4kBh4PEVaFWCjwuhVIx86uIvZpPwEJ3AlnUzGm6iKE-z4IaiLpULC0-FB6UxQR9b8DNqQUHNoY4B_myjf3pILuGeYPCSzWmmH0vvDG_zsU8gekBdSPvpsal41NIU4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD-jy2ntZScXPc-EgaGAc38KBI_YhRUYl1mRN7RcxuAMIkJKii9F6LQVCyKNHjGMkG-bpoQHKVUgshJTcK7ahZLGBwx4-q33Y93lGSjfvWRqUOAY7lVcD7HlnrVjx2U_fOeB7BCQ50F9uXL6xQutaqSXbeCFakke4N5xVonnwcoNHlOLL25VqfbCQvEIUL0FU-cItwo0L9VDmlz6HoE9jYd8iT4eM7fGYnw-9FuYJW0T_JRCQAYNxCg-zHtXE9_kMGAtQ0Bpw3KjfM",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA4ZMzPWHir-QvitLQbaWtq4dkFiPYU6TuxAkUlh8e7EMYfQCA7XGHEMxZ5kCmImqqWOoprsDJulEVGttbT5dft2cwYphTirdVBL94HfJ0wmaYZRRLv8VfS_pJ_wnuXW9RVHpyXkQz70b7yfeWSI-F_Bx_l041NwTTtKRAEkqWusrevXWjry40WUbYn_JUMwutYWxNCAmpWktj9wUfZeBxzQyDuY_ZoGn92IsqH_XNeiTWQPNweIcCVrfq2kcs2IBjk9Y_8h_BejII",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCY1pJAtpkQP521addbeH3ObF1aIwimoWU1DKFSD9KynOt_BOaB1S2m7uqIVRyb5AL0met6Ksqfu4FZnafL-cxBD6qjY4o14ty_pGBrHDuRO4Lov2i6I9nwy5NbNlT3Sb0Z0XPPrHOmPiu55QEn8xdsSKgGWRSG66m06bAJjx7x4kqvDJdvUC3QTpWrzhqiuG_-25bLbaD6dee6titau2aXK4weEE8FKdOJYuvZ8bKQLuFqEzCEhlM7TNoHI6QFNQPVD7GJVw9UTII",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB0FWAoY-qpFwIzQY_6NmtA-SM2ncwUiYZAEuYUEBom83LsxojIR6fgowWoE7PdG45wh2SSerECtQEUEHwxh6gRhXL-oNcyaZnuPwqItJdMvc-t7COhLSmV-06APiGC5HxJHdnezjXuFWJq0Fb5YZGjzyZ2qWd7Fq4ZLmiYLQK5LhcyaZl5pnP1XTbM51FlwZgCE5UOUSmdUXEkF48IbBGIejauxbuRCBVIt-yzfoiuyZK2WXMMIlJ2pnr6kn0_HXLqvqcwecc6uPg",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD3OsDyhnFqXzSJHKxU3VZLgnIZx6jvMhqJ2FHlA43Mgn74OXo5m5VKtoHeCvGEkRzvuhfunKedZMPeUb6AAwq0H-pCxJX1Z0uS14BwJD9oB-WfI5MIRb7nQUcrogEYUvoiuXBfC4hwKnM5OrbxSnYNmzlIZY51QtT0oGQMDntm7E1PLGh2POZV4wSwUwKmdCaBBAPnqjWQrFAU0W7KijPd0W5mDAj14bwUkG-E8HVPn6gpy0K1FdFBwzv8nUXLJVdQhRwB_ZfcIa0",
];
const TITLES = [
  "Shadows of Desire",
  "Gilded Captive",
  "Night Court",
  "Silk & Scandal",
  "Forbidden Vow",
  "Midnight Satin",
];
const AUTHORS = [
  "Seraphina Thorne",
  "Julian Vance",
  "Elena Rose",
  "Marcus Hale",
  "Isolde Quinn",
  "Evelyn Thorne",
];
const RATINGS = ["4.9", "4.8", "5.0", "4.7", "4.6", "4.9"];

function coverCard(prefix, i, cardW) {
  const h = Math.round(cardW * 1.5);
  const rating = RATINGS[i % RATINGS.length];
  // Only show star badges on some cards (matches HTML density)
  const showRating = i % 2 === 0 || i === 2;
  const coverChildren = [
    {
      type: "rectangle",
      id: `${prefix}-img-${i}`,
      x: 0,
      y: 0,
      width: cardW,
      height: h,
      fill: { type: "image", url: COVERS[i % COVERS.length], mode: "fill" },
    },
    {
      type: "rectangle",
      id: `${prefix}-vignette-${i}`,
      x: 0,
      y: 0,
      width: cardW,
      height: h,
      fill: {
        type: "gradient",
        gradientType: "linear",
        rotation: 180,
        colors: [
          { color: "#00000000", position: 0.4 },
          { color: "#00000099", position: 1 },
        ],
      },
    },
  ];
  if (showRating) {
    coverChildren.push({
      type: "frame",
      id: `${prefix}-rating-${i}`,
      x: Math.max(8, cardW - 48),
      y: 8,
      height: 22,
      fill: "#050505CC",
      cornerRadius: 2,
      stroke: { align: "inside", thickness: 1, fill: "#D4AF374D" },
      layout: "horizontal",
      gap: 4,
      padding: [2, 6],
      alignItems: "center",
      children: [
        icon(`${prefix}-star-${i}`, "star", {
          size: 12,
          fill: "$color.primary",
        }),
        text(`${prefix}-rating-t-${i}`, rating, {
          fontFamily: "Playfair Display",
          fontSize: 10,
          fontWeight: "700",
          fill: "$color.primary",
        }),
      ],
    });
  }

  return {
    type: "frame",
    id: `${prefix}-card-${i}`,
    layout: "vertical",
    gap: 8,
    width: cardW,
    children: [
      {
        type: "frame",
        id: `${prefix}-cover-${i}`,
        width: cardW,
        height: h,
        clip: true,
        cornerRadius: 2,
        layout: "none",
        fill: "$color.surface",
        stroke: { align: "inside", thickness: 1, fill: "#D4AF370D" },
        children: coverChildren,
      },
      text(`${prefix}-title-${i}`, TITLES[i % TITLES.length], {
        fontFamily: "Playfair Display",
        fontSize: 14,
        fontStyle: "italic",
        fontWeight: "700",
        width: cardW,
      }),
      text(`${prefix}-author-${i}`, AUTHORS[i % AUTHORS.length], {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.textMuted",
        letterSpacing: 1,
        width: cardW,
      }),
    ],
  };
}

/** Centered Library title + search (matches the_library_grid.html sticky header). */
function header(prefix) {
  return {
    type: "frame",
    id: `${prefix}-header`,
    width: "fill_container",
    height: 64,
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    padding: [16, 24],
    fill: "#050505F2",
    stroke: { align: "inside", thickness: { bottom: 1 }, fill: "#D4AF371A" },
    children: [
      { type: "frame", id: `${prefix}-h-spacer`, width: 24, height: 24 },
      text(`${prefix}-h`, "Library", {
        fontFamily: "Cinzel",
        fontSize: 18,
        fill: "$color.primary",
        letterSpacing: 4,
        textAlign: "center",
      }),
      icon(`${prefix}-search`, "search", { size: 24, fill: "$color.primary" }),
    ],
  };
}

/** "12 novels" + grid/list toggle toolbar. */
function toolbar(prefix) {
  return {
    type: "frame",
    id: `${prefix}-toolbar`,
    width: "fill_container",
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    padding: [12, 24],
    children: [
      text(`${prefix}-count`, "12 novels", {
        fontFamily: "Marcellus",
        fontSize: 12,
        fill: "$color.textMuted",
        letterSpacing: 1.5,
      }),
      {
        type: "frame",
        id: `${prefix}-view-toggle`,
        layout: "horizontal",
        gap: 16,
        alignItems: "center",
        children: [
          icon(`${prefix}-grid`, "grid_view", { size: 20, fill: "$color.primary" }),
          icon(`${prefix}-list`, "view_list", { size: 20, fill: "#8A8A8A" }),
        ],
      },
    ],
  };
}

function grid(prefix, cols, shellW, pad = 24, gap = 20) {
  const inner = shellW - pad * 2;
  const cardW = Math.floor((inner - gap * (cols - 1)) / cols);
  const rowGap = 32;
  const items = [];
  for (let i = 0; i < cols * 2; i++) items.push(coverCard(prefix, i, cardW));
  const rows = [];
  for (let r = 0; r < 2; r++) {
    rows.push({
      type: "frame",
      id: `${prefix}-row-${r}`,
      layout: "horizontal",
      gap,
      width: "fill_container",
      children: items.slice(r * cols, r * cols + cols),
    });
  }
  return {
    type: "frame",
    id: `${prefix}-grid`,
    width: "fill_container",
    height: "fill_container",
    layout: "vertical",
    gap: rowGap,
    padding: [8, pad, 24, pad],
    children: rows,
  };
}

function artboard(id, name, x, w, cols, pad, gap, height) {
  const prefix = id.includes("mobile") ? "lm" : "lt";
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
      header(prefix),
      toolbar(prefix),
      grid(prefix, cols, w, pad, gap),
      bottomNav(prefix, "library"),
    ],
  };
}

writePen(path.join(__dirname, "the_library.pen"), [
  artboard(
    "artboard-library-mobile",
    "Library — the_library_grid.html (mobile)",
    artboardX(0),
    MOBILE_W,
    2,
    24,
    20,
    844
  ),
  artboard(
    "artboard-library-tablet",
    "Library — tablet 3-column grid",
    artboardX(1),
    TABLET_W,
    3,
    32,
    24,
    1112
  ),
]);
