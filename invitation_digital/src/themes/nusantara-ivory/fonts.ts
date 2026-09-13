import { Cormorant_Garamond, Jost } from "next/font/google";

/** Display face — high-contrast serif for names, section titles, numerals. */
export const displaySerif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-nusantara-serif",
});

/** Supporting face — geometric sans for body copy, labels, forms. */
export const bodySans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-nusantara-sans",
});
