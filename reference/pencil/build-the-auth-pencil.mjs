#!/usr/bin/env node
/**
 * Auth shells — Clerk-aligned sign-in / sign-up (mobile + tablet) → the_auth.pen
 * Visual noir chrome matching app clerkAppearance; not legacy password forms.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  MOBILE_W,
  TABLET_W,
  artboardX,
  goldPill,
  icon,
  shellStroke,
  text,
  writePen,
} from "./pencil-tokens.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function field(prefix, label, placeholder) {
  return {
    type: "frame",
    id: `${prefix}-field-${label}`,
    layout: "vertical",
    gap: 8,
    width: "fill_container",
    children: [
      text(`${prefix}-lab-${label}`, label.toUpperCase(), {
        fontFamily: "Marcellus",
        fontSize: 11,
        fill: "$color.textMuted",
        letterSpacing: 2,
      }),
      {
        type: "frame",
        id: `${prefix}-input-${label}`,
        width: "fill_container",
        height: 56,
        fill: "$color.surfaceHighlight",
        stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
        cornerRadius: 0,
        layout: "horizontal",
        alignItems: "center",
        padding: [0, 16],
        children: [
          text(`${prefix}-ph-${label}`, placeholder, {
            fontFamily: "Literata",
            fontSize: 14,
            fill: "$color.textMuted",
          }),
        ],
      },
    ],
  };
}

function authCard(prefix, mode, cardW) {
  const isSignIn = mode === "sign-in";
  return {
    type: "frame",
    id: `${prefix}-card`,
    width: cardW,
    layout: "vertical",
    gap: 20,
    padding: 28,
    cornerRadius: 2,
    fill: "$color.surface",
    stroke: { align: "inside", thickness: 1, fill: "#D4AF3733" },
    children: [
      {
        type: "frame",
        id: `${prefix}-brand`,
        layout: "vertical",
        gap: 8,
        alignItems: "center",
        width: "fill_container",
        children: [
          icon(`${prefix}-book`, "menu_book", { size: 36 }),
          text(`${prefix}-h`, isSignIn ? "Welcome back" : "Join Midnight Satin", {
            fontFamily: "Playfair Display",
            fontSize: 26,
            fontStyle: "italic",
            fill: "$color.primary",
            textAlign: "center",
            width: cardW - 56,
          }),
          text(
            `${prefix}-sub`,
            isSignIn
              ? "Sign in to continue reading"
              : "Create an account — 200 welcome credits",
            {
              fontFamily: "Marcellus",
              fontSize: 12,
              fill: "$color.textMuted",
              letterSpacing: 1,
              textAlign: "center",
              width: cardW - 56,
            }
          ),
        ],
      },
      field(prefix, "email", "you@example.com"),
      field(prefix, "password", "••••••••"),
      ...(!isSignIn
        ? [field(prefix, "display name", "Your reading name")]
        : []),
      {
        ...goldPill(`${prefix}-cta`, isSignIn ? "SIGN IN" : "CREATE ACCOUNT"),
        width: "fill_container",
      },
      text(
        `${prefix}-swap`,
        isSignIn ? "Need an account? Sign up" : "Already have an account? Sign in",
        {
          fontFamily: "Literata",
          fontSize: 13,
          fill: "$color.primary",
          textAlign: "center",
          width: cardW - 56,
        }
      ),
      text(`${prefix}-clerk`, "Powered by Clerk", {
        fontFamily: "Marcellus",
        fontSize: 10,
        fill: "$color.textMuted",
        letterSpacing: 1,
        textAlign: "center",
        width: cardW - 56,
      }),
    ],
  };
}

function artboard(id, name, x, w, mode) {
  const cardW = Math.min(400, w - 48);
  return {
    id,
    name,
    type: "frame",
    x,
    y: 0,
    width: w,
    height: 900,
    fill: "$color.void",
    layout: "vertical",
    justifyContent: "center",
    alignItems: "center",
    clip: true,
    stroke: shellStroke(),
    padding: 24,
    children: [authCard(id, mode, cardW)],
  };
}

writePen(path.join(__dirname, "the_auth.pen"), [
  artboard(
    "artboard-signin-mobile",
    "Sign in — Clerk shell (mobile)",
    artboardX(0),
    MOBILE_W,
    "sign-in"
  ),
  artboard(
    "artboard-signup-tablet",
    "Sign up — Clerk shell (tablet)",
    artboardX(1),
    TABLET_W,
    "sign-up"
  ),
  {
    ...artboard(
      "artboard-signin-tablet",
      "Sign in — Clerk shell (tablet)",
      artboardX(1),
      TABLET_W,
      "sign-in"
    ),
    x: artboardX(1),
    y: 980,
  },
  {
    ...artboard(
      "artboard-signup-mobile",
      "Sign up — Clerk shell (mobile)",
      artboardX(0),
      MOBILE_W,
      "sign-up"
    ),
    x: artboardX(0),
    y: 980,
  },
]);
