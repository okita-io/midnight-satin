/**
 * Shared Pencil tokens + DS-aligned primitives for Midnight Satin screen generators.
 *
 * Pencil cannot `ref` components across files — these factories mirror
 * `design_system.pen` reusables (MS · …) so screens stay visually unified.
 */
import fs from "node:fs";

export const MOBILE_W = 390;
export const TABLET_W = 834;
export const ARTBOARD_GAP = 80;
export const VERSION = "2.14";

export const variables = {
  "color.primary": { type: "color", value: "#D4AF37" },
  "color.void": { type: "color", value: "#050505" },
  "color.surface": { type: "color", value: "#121212" },
  "color.surfaceHighlight": { type: "color", value: "#1A1A1A" },
  "color.textMain": { type: "color", value: "#EAEAEA" },
  "color.textMuted": { type: "color", value: "#8A8A8A" },
  "color.accent": { type: "color", value: "#800020" },
  "color.navBg": { type: "color", value: "#080808" },
  "font.display": { type: "string", value: "Playfair Display" },
  "font.header": { type: "string", value: "Cinzel" },
  "font.heading": { type: "string", value: "Cinzel" },
  "font.body": { type: "string", value: "Literata" },
  "font.ui": { type: "string", value: "Marcellus" },
  "font.script": { type: "string", value: "Pinyon Script" },
  "radius.card": { type: "number", value: 2 },
  "radius.input": { type: "number", value: 0 },
  "radius.modal": { type: "number", value: 4 },
  "shadow.card.offsetY": { type: "number", value: 10 },
  "shadow.card.blur": { type: "number", value: 30 },
  "shadow.modalGlow.blur": { type: "number", value: 20 },
  "shadow.goldGlow.blur": { type: "number", value: 24 },
  "space.screenPad": { type: "number", value: 24 },
  "space.sectionGap": { type: "number", value: 16 },
};

/** Tablet reading column (max-w-2xl) inside 834 shell */
export const TABLET_READ_COL = 672;

export function artboardX(index) {
  if (index === 0) return 0;
  return MOBILE_W + ARTBOARD_GAP;
}

export function shellStroke() {
  return {
    align: "inside",
    thickness: { left: 1, right: 1, top: 0, bottom: 0 },
    fill: "#1A1A1A",
  };
}

export function hairlineStroke(fill = "#FFFFFF0D") {
  return { align: "inside", thickness: 1, fill };
}

export function text(id, content, opts = {}) {
  const node = {
    type: "text",
    id,
    content,
    fill: opts.fill ?? "$color.textMain",
    fontFamily: opts.fontFamily ?? "Literata",
    fontSize: opts.fontSize ?? 14,
    fontWeight: opts.fontWeight ?? "normal",
  };
  if (opts.fontStyle) node.fontStyle = opts.fontStyle;
  if (opts.letterSpacing != null) node.letterSpacing = opts.letterSpacing;
  if (opts.lineHeight != null) node.lineHeight = opts.lineHeight;
  if (opts.textAlign) node.textAlign = opts.textAlign;
  if (opts.width != null) {
    node.width = opts.width;
    node.textGrowth = opts.textGrowth ?? "fixed-width";
  } else {
    node.textGrowth = opts.textGrowth ?? "auto";
  }
  return node;
}

export function icon(id, name, opts = {}) {
  return {
    type: "icon",
    id,
    library: "Material Symbols Outlined",
    icon: name,
    width: opts.size ?? 24,
    height: opts.size ?? 24,
    fill: opts.fill ?? "$color.primary",
    weight: opts.weight ?? 400,
  };
}

/** MS · Type · Section title (Cinzel) */
export function sectionTitle(id, label, opts = {}) {
  return text(id, label, {
    fontFamily: "Cinzel",
    fontSize: opts.fontSize ?? 13,
    letterSpacing: opts.letterSpacing ?? 2,
    fill: opts.fill ?? "#FFFFFFE6",
    fontWeight: opts.fontWeight ?? "500",
  });
}

/** MS · Link · View all (UI uppercase) */
export function viewAllLink(id, label = "View All", opts = {}) {
  return text(id, label, {
    fontFamily: "Marcellus",
    fontSize: opts.fontSize ?? 10,
    letterSpacing: opts.letterSpacing ?? 3,
    fill: opts.fill ?? "$color.primary",
  });
}

/** Section rail: title + optional view-all (DS section label / current-affairs header) */
export function sectionHeaderRow(id, title, opts = {}) {
  const children = [sectionTitle(`${id}-title`, title, opts.titleOpts)];
  if (opts.viewAll !== false) {
    children.push(viewAllLink(`${id}-view-all`, opts.viewAllLabel ?? "View All", opts.linkOpts));
  }
  return {
    type: "frame",
    id,
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "center",
    width: "fill_container",
    children,
  };
}

/** MS · Type · Subsection label (muted + optional rule) */
export function subsectionLabel(id, label, opts = {}) {
  const kids = [
    text(`${id}-text`, label, {
      fontFamily: "Marcellus",
      fontSize: opts.fontSize ?? 11,
      letterSpacing: opts.letterSpacing ?? 3,
      fill: opts.fill ?? "$color.textMuted",
    }),
  ];
  if (opts.withRule !== false) {
    kids.push({
      type: "rectangle",
      id: `${id}-rule`,
      width: opts.ruleWidth ?? "fill_container",
      height: 1,
      fill: "#FFFFFF14",
    });
  }
  return {
    type: "frame",
    id,
    layout: "vertical",
    gap: 8,
    width: "fill_container",
    children: kids,
  };
}

/** MS · Layout · Progress bar — muted track + gold fill */
export function progressBar(id, opts = {}) {
  const trackW = opts.width ?? "fill_container";
  const fillW = opts.fillWidth ?? 120;
  const height = opts.height ?? 4;
  return {
    type: "frame",
    id,
    width: trackW,
    height,
    fill: opts.trackFill ?? "#FFFFFF1A",
    cornerRadius: opts.cornerRadius ?? 2,
    layout: "none",
    clip: true,
    children: [
      {
        type: "rectangle",
        id: `${id}-fill`,
        x: 0,
        y: 0,
        width: typeof fillW === "number" ? fillW : 120,
        height,
        fill: opts.fill ?? "$color.primary",
      },
    ],
  };
}

/** MS · Card chrome — surface + hairline + optional depth shadow */
export function surfaceCard(id, children, opts = {}) {
  const node = {
    type: "frame",
    id,
    layout: opts.layout ?? "vertical",
    gap: opts.gap ?? 0,
    padding: opts.padding ?? 16,
    fill: opts.fill ?? "$color.surface",
    stroke: opts.stroke ?? hairlineStroke(),
    cornerRadius: opts.cornerRadius ?? 2,
    width: opts.width ?? "fill_container",
    children,
  };
  if (opts.height != null) node.height = opts.height;
  if (opts.alignItems) node.alignItems = opts.alignItems;
  if (opts.justifyContent) node.justifyContent = opts.justifyContent;
  if (opts.withShadow) {
    node.effect = {
      type: "shadow",
      shadowType: "outer",
      color: "#00000066",
      offset: { x: 0, y: 10 },
      blur: 30,
    };
  }
  return node;
}

/** MS · Button · Primary gold pill */
export function goldPill(id, label) {
  return {
    type: "frame",
    id,
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    padding: [12, 28],
    cornerRadius: 2,
    fill: "$color.primary",
    children: [
      text(`${id}-label`, label, {
        fontFamily: "Marcellus",
        fontSize: 13,
        fontWeight: "700",
        fill: "$color.void",
        letterSpacing: 2,
      }),
    ],
  };
}

/** MS · Button · Secondary outline */
export function secondaryOutline(id, label) {
  return {
    type: "frame",
    id,
    layout: "horizontal",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    padding: [12, 28],
    cornerRadius: 2,
    fill: "#00000000",
    stroke: { align: "inside", thickness: 1, fill: "$color.primary" },
    children: [
      text(`${id}-label`, label, {
        fontFamily: "Marcellus",
        fontSize: 13,
        fontWeight: "500",
        fill: "$color.primary",
        letterSpacing: 2,
      }),
    ],
  };
}

/** MS · HUD · Icon + micro-label */
export function hudIconColumn(id, glyph, label, opts = {}) {
  const active = Boolean(opts.active);
  return {
    type: "frame",
    id,
    layout: "vertical",
    alignItems: "center",
    gap: 4,
    children: [
      icon(`${id}-icon`, glyph, {
        size: active ? 28 : 24,
        fill: active ? "$color.primary" : opts.fill ?? "#FFFFFF99",
      }),
      text(`${id}-label`, label, {
        fontFamily: "Marcellus",
        fontSize: 9,
        fill: active ? "$color.primary" : "$color.textMuted",
        letterSpacing: 1,
      }),
    ],
  };
}

/** MS · Icon · Gradient rule + center glyph (ornament) */
export function decorativeRule(id, opts = {}) {
  const ruleW = opts.ruleWidth ?? 32;
  return {
    type: "frame",
    id,
    width: "fill_container",
    layout: "horizontal",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    children: [
      {
        type: "rectangle",
        id: `${id}-rule-l`,
        width: ruleW,
        height: 1,
        fill: "$color.primary",
      },
      {
        type: "rectangle",
        id: `${id}-diamond`,
        width: 8,
        height: 8,
        fill: "$color.void",
        stroke: { align: "inside", thickness: 1, fill: "$color.primary" },
      },
      {
        type: "rectangle",
        id: `${id}-rule-r`,
        width: ruleW,
        height: 1,
        fill: "$color.primary",
      },
    ],
  };
}

/** MS · Back · Icon + label */
export function backControl(id, label = "Back", opts = {}) {
  return {
    type: "frame",
    id,
    layout: "horizontal",
    alignItems: "center",
    gap: 8,
    children: [
      icon(`${id}-icon`, "arrow_back", {
        size: opts.size ?? 24,
        fill: opts.fill ?? "#D4AF37CC",
      }),
      ...(opts.showLabel
        ? [
            text(`${id}-label`, label, {
              fontFamily: "Marcellus",
              fontSize: 12,
              fill: opts.fill ?? "#D4AF37CC",
              letterSpacing: 1,
            }),
          ]
        : []),
    ],
  };
}

/**
 * MS · Nav primary tab bar — matches design_system nav demo glyphs
 * (history_edu / local_library / storefront / newspaper / person_3).
 */
export function bottomNav(idPrefix, active = "home") {
  const tabs = [
    { id: "home", label: "Boudoir", glyph: "history_edu" },
    { id: "library", label: "Library", glyph: "local_library" },
    { id: "vault", label: "Vault", glyph: "storefront" },
    { id: "updates", label: "Updates", glyph: "newspaper" },
    { id: "profile", label: "Profile", glyph: "person_3" },
  ];
  return {
    type: "frame",
    id: `${idPrefix}-bottom-nav`,
    width: "fill_container",
    height: 96,
    fill: "$color.navBg",
    layout: "horizontal",
    justifyContent: "space_between",
    alignItems: "end",
    padding: [16, 24, 28, 24],
    stroke: { align: "inside", thickness: { top: 1 }, fill: "#1F1F1F" },
    effect: {
      type: "shadow",
      shadowType: "outer",
      color: "#000000CC",
      offset: { x: 0, y: -10 },
      blur: 40,
    },
    children: tabs.map((t) => {
      const isActive = t.id === active;
      return {
        type: "frame",
        id: `${idPrefix}-tab-${t.id}`,
        layout: "vertical",
        alignItems: "center",
        gap: 4,
        children: [
          {
            type: "frame",
            id: `${idPrefix}-tab-${t.id}-icon-wrap`,
            layout: "vertical",
            alignItems: "center",
            gap: 4,
            children: [
              icon(`${idPrefix}-tab-${t.id}-icon`, t.glyph, {
                size: isActive ? 28 : 24,
                fill: isActive ? "$color.primary" : "#FFFFFF99",
              }),
              ...(isActive
                ? [
                    {
                      type: "ellipse",
                      id: `${idPrefix}-tab-${t.id}-dot`,
                      width: 4,
                      height: 4,
                      fill: "$color.primary",
                    },
                  ]
                : []),
            ],
          },
          text(`${idPrefix}-tab-${t.id}-label`, t.label, {
            fontFamily: "Marcellus",
            fontSize: 10,
            fill: isActive ? "$color.primary" : "$color.textMuted",
            letterSpacing: 2,
            fontWeight: "500",
          }),
        ],
      };
    }),
  };
}

/** Reading HUD footer: progress + tool icon columns (MS · Reading HUD footer) */
export function readingHudFooter(idPrefix, opts = {}) {
  const tools = opts.tools ?? [
    { glyph: "text_fields", label: "Type" },
    { glyph: "list", label: "Chapters" },
    { glyph: "history_edu", label: "Notes" },
    { glyph: "settings", label: "Set" },
  ];
  const fillWidth = opts.progressFill ?? 136;
  return {
    type: "frame",
    id: `${idPrefix}-hud-bottom`,
    width: "fill_container",
    layout: "vertical",
    fill: "$color.navBg",
    stroke: { align: "inside", thickness: { top: 1 }, fill: "#1F1F1F" },
    children: [
      progressBar(`${idPrefix}-progress`, { fillWidth, height: 4 }),
      {
        type: "frame",
        id: `${idPrefix}-tools`,
        width: "fill_container",
        height: 72,
        layout: "horizontal",
        justifyContent: "space_around",
        alignItems: "center",
        padding: [8, 16, 16, 16],
        children: tools.map((t, i) =>
          hudIconColumn(`${idPrefix}-tool-${i}`, t.glyph, t.label, {
            active: t.active,
          })
        ),
      },
    ],
  };
}

/**
 * Cast portrait chrome — mirrors design_system.pen MS · Character portrait card.
 * Trophy / Top Pick top-left; Endorse rose top-right. Positions scale with cardW
 * (DS card is 358 wide → endorse at x:290).
 */
export function castTopPickBadge(idPrefix, opts = {}) {
  const x = opts.x ?? 16;
  const y = opts.y ?? 16;
  return {
    type: "frame",
    id: `${idPrefix}-trophy`,
    x,
    y,
    width: 72,
    height: 72,
    layout: "vertical",
    gap: 6,
    alignItems: "center",
    children: [
      {
        type: "frame",
        id: `${idPrefix}-trophy-badge`,
        width: 40,
        height: 40,
        cornerRadius: 20,
        fill: "#121212CC",
        stroke: { align: "inside", thickness: 1, fill: "$color.primary" },
        layout: "horizontal",
        justifyContent: "center",
        alignItems: "center",
        effect: {
          type: "shadow",
          shadowType: "outer",
          blur: 12,
          spread: 0,
          color: "#D4AF3766",
          offset: { x: 0, y: 0 },
        },
        children: [icon(`${idPrefix}-trophy-icon`, "emoji_events", { size: 22 })],
      },
      text(`${idPrefix}-trophy-cap`, "Top Pick", {
        fontFamily: "Cinzel",
        fontSize: 10,
        fontWeight: "500",
        fill: "$color.primary",
        letterSpacing: 1.5,
      }),
    ],
  };
}

export function castEndorseButton(idPrefix, count, opts = {}) {
  const cardW = opts.cardW ?? 358;
  const width = 58;
  const x = opts.x ?? Math.max(16, cardW - width - 10);
  const y = opts.y ?? 13;
  return {
    type: "frame",
    id: `${idPrefix}-endorse`,
    name: "Endorse button",
    x,
    y,
    width,
    height: 75,
    fill: "#800020E6",
    cornerRadius: 17,
    stroke: { align: "inside", thickness: 2.5, fill: "#FFFFFF17" },
    effect: {
      type: "shadow",
      shadowType: "outer",
      color: "#80002059",
      offset: { x: 0, y: 8 },
      blur: 20,
    },
    layout: "vertical",
    gap: 4,
    padding: [8, 12],
    justifyContent: "center",
    alignItems: "center",
    children: [
      icon(`${idPrefix}-rose`, "local_florist", { size: 18, fill: "#FFFFFF" }),
      text(`${idPrefix}-endorse-l`, "Endorse", {
        fontFamily: "Marcellus",
        fontSize: 10,
        fill: "#FFFFFF",
        letterSpacing: 2,
      }),
      {
        type: "frame",
        id: `${idPrefix}-count`,
        height: 20,
        fill: "#05050559",
        cornerRadius: 999,
        padding: [2, 8],
        justifyContent: "center",
        alignItems: "center",
        children: [
          text(`${idPrefix}-count-t`, count, {
            fontFamily: "Playfair Display",
            fontSize: 10,
            fontWeight: "700",
            fill: "$color.primary",
          }),
        ],
      },
    ],
  };
}

export function writePen(outPath, children) {
  const doc = { version: VERSION, variables, children };
  fs.writeFileSync(outPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  console.log("Wrote", outPath);
  return outPath;
}
