export const KELIR_KENCANA_TOKENS = {
  slug: "kelir-kencana",
  colors: {
    /** Malam — the dark theatre around the screen: cover, closing, nav. */
    malam: "#1C1510",
    /** Kelir — the lit cotton screen; the reading surface. */
    kelir: "#F2E7D0",
    /** Kelir in the screen's shade; the secondary field. */
    kelirDeep: "#E8D7B4",
    /** Sogan — body text, shadow figures and the gunungan on kelir. */
    sogan: "#3D2314",
    /** Sogan softened for secondary text; AA on kelir and kelirDeep. */
    soganSoft: "#6B4A33",
    /** Prada — rails, the primary action, event titles, the active nav marker. */
    prada: "#8E2B1F",
    /** Kencana — gold on malam; ornament only on kelir (2.4:1). */
    kencana: "#C09435",
    /** Kencana deepened for text on kelir (AA). */
    kencanaInk: "#84601D",
  },
} as const;

export const KELIR_KENCANA_FIGURES = {
  satria: { src: "/themes/kelir-kencana/wayang-satria.webp", width: 282, height: 386 },
  putri: { src: "/themes/kelir-kencana/wayang-putri.webp", width: 262, height: 380 },
} as const;
