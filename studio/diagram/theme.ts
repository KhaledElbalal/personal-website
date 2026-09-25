// Brand theme for the diagram editor: site palette + site fonts, so what's
// drawn in Studio matches what the blog renders.
import { DEFAULT_THEME, type TLFontFace, type TLTheme } from "tldraw";

import interBold from "@fontsource/inter/files/inter-latin-700-normal.woff2?url";
import interRegular from "@fontsource/inter/files/inter-latin-400-normal.woff2?url";
import poppinsBold from "@fontsource/poppins/files/poppins-latin-700-normal.woff2?url";
import poppinsItalic from "@fontsource/poppins/files/poppins-latin-400-italic.woff2?url";
import poppinsRegular from "@fontsource/poppins/files/poppins-latin-400-normal.woff2?url";
import spaceMonoBold from "@fontsource/space-mono/files/space-mono-latin-700-normal.woff2?url";
import spaceMonoRegular from "@fontsource/space-mono/files/space-mono-latin-400-normal.woff2?url";

export const INK = "#121420"; // Xiketic
export const ACCENT = "#0067a8"; // AA-safe Tufts Blue (site --accent)
export const ACCENT_BRIGHT = "#38b6ff"; // Maya Blue
export const MUTED = "rgba(18, 20, 32, 0.65)";
export const CARD_SHADOW = "rgba(0, 103, 168, 0.30)";

// Family names the blog maps back onto its next/font variables
// (see `.sd-diagram` rules in app/globals.css).
export const FONT = {
  mono: "sd_mono",
  sans: "sd_sans",
  body: "sd_body",
} as const;

const face = (
  family: string,
  url: string,
  weight: "normal" | "bold",
  style: "normal" | "italic" = "normal",
): TLFontFace => ({ family, src: { url, format: "woff2" }, weight, style });

const monoFaces = [
  face(FONT.mono, spaceMonoRegular, "normal"),
  face(FONT.mono, spaceMonoBold, "bold"),
];
const sansFaces = [
  face(FONT.sans, interRegular, "normal"),
  face(FONT.sans, interBold, "bold"),
];
const bodyFaces = [
  face(FONT.body, poppinsRegular, "normal"),
  face(FONT.body, poppinsBold, "bold"),
  face(FONT.body, poppinsItalic, "normal", "italic"),
];

export const SITE_FONT_FACES = [...monoFaces, ...sansFaces, ...bodyFaces];

const light = DEFAULT_THEME.colors.light;

export const SITE_THEME: TLTheme = {
  ...DEFAULT_THEME,
  strokeWidth: 1.5,
  fonts: {
    // "draw" is tldraw's handwriting font — map it to Poppins so no
    // shape ever renders off-brand text.
    draw: { ...DEFAULT_THEME.fonts.draw, fontFamily: `'${FONT.body}', sans-serif`, faces: bodyFaces },
    sans: { ...DEFAULT_THEME.fonts.sans, fontFamily: `'${FONT.sans}', sans-serif`, faces: sansFaces },
    serif: { ...DEFAULT_THEME.fonts.serif, fontFamily: `'${FONT.body}', sans-serif`, faces: bodyFaces },
    mono: { ...DEFAULT_THEME.fonts.mono, fontFamily: `'${FONT.mono}', monospace`, faces: monoFaces },
  },
  colors: {
    ...DEFAULT_THEME.colors,
    light: {
      ...light,
      background: "#ffffff",
      text: INK,
      black: { ...light.black, solid: INK, noteText: INK, frameText: INK, frameStroke: INK },
      blue: {
        ...light.blue,
        solid: ACCENT,
        semi: "#e6f1f8",
        fill: ACCENT,
        linedFill: "#cfe5f3",
        frameStroke: ACCENT,
        frameText: ACCENT,
        frameHeadingStroke: ACCENT,
        frameHeadingFill: "#e6f1f8",
        frameFill: "#f5fafd",
        noteFill: "#e6f1f8",
        noteText: INK,
      },
      "light-blue": {
        ...light["light-blue"],
        solid: ACCENT_BRIGHT,
        semi: "#e8f6ff",
        fill: ACCENT_BRIGHT,
        noteFill: "#e8f6ff",
        noteText: INK,
      },
    },
  },
};
