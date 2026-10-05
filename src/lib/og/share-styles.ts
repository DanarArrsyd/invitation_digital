/**
 * Colours and script face for each theme's share banner (the image social
 * apps show for a link). Kept apart from the theme registry so the banner
 * routes don't pull theme components in. A theme without an entry, such as
 * one added to the catalogue before its banner style, falls back to the
 * Temuraya brand style, so every link still gets a banner.
 */
export type ShareScript = "great-vibes" | "herr-von-muellerhoff" | "imperial-script" | "corinthia";

export interface ShareStyle {
  /** Main canvas behind the text. */
  background: string;
  /** The picture side of the banner. */
  panel: string;
  ink: string;
  muted: string;
  accent: string;
  /** Script face used for names. */
  script: ShareScript;
}

export const BRAND_SHARE_STYLE: ShareStyle = {
  background: "#f4f5f1",
  panel: "#1f2b25",
  ink: "#17201b",
  muted: "#5b645e",
  accent: "#a08552",
  script: "great-vibes",
};

export const THEME_SHARE_STYLES: Record<string, ShareStyle> = {
  "nusantara-ivory": {
    background: "#F8F1E4",
    panel: "#E9DCC4",
    ink: "#2B1A10",
    muted: "#74553D",
    accent: "#A87A3D",
    script: "great-vibes",
  },
  "terra-botanica": {
    background: "#FBF7EE",
    panel: "#F2EBDD",
    ink: "#4A3426",
    muted: "#4E5B3A",
    accent: "#B5653E",
    script: "herr-von-muellerhoff",
  },
  "midnight-atelier": {
    background: "#14121A",
    panel: "#5E1A22",
    ink: "#F3EAD8",
    muted: "#CDBF9F",
    accent: "#D8C08A",
    script: "imperial-script",
  },
  "cobalt-riviera": {
    background: "#F7F4EC",
    panel: "#1D3E9E",
    ink: "#14275F",
    muted: "#4A5878",
    accent: "#E8743B",
    script: "corinthia",
  },
};

export function getShareStyle(themeSlug: string | null | undefined): ShareStyle {
  return (themeSlug && THEME_SHARE_STYLES[themeSlug]) || BRAND_SHARE_STYLE;
}
