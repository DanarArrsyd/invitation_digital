import { Fraunces, Manrope } from "next/font/google";

export const displaySerif = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tb-display",
});

export const bodySans = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-tb-body",
});
