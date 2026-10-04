import type { ReactNode } from "react";

import type { NavSectionKey } from "@/themes/shared/nav-priority";

// Thin, mitred geometry in the couture / art-deco register: arches, rings,
// ticket stubs and cut corners rather than rounded UI pictograms.
const GLYPHS: Record<NavSectionKey, ReactNode> = {
  // Marquee arch with a rising sunburst.
  hero: (
    <>
      <path d="M5 20.5V11a7 7 0 0 1 14 0v9.5M3 20.5h18" />
      <path d="M8.5 16.5a3.5 3.5 0 0 1 7 0M8.5 16.5h7" />
      <path d="M12 13V7.5M9.6 13.7 7.5 9.6M14.4 13.7l2.1-4.1" />
    </>
  ),
  // Two interlocked rings beneath a cut diamond.
  couple: (
    <>
      <circle cx="9" cy="14" r="5" />
      <circle cx="15" cy="14" r="5" />
      <path d="M15 3.5 16.4 6 15 8.5 13.6 6Z" />
    </>
  ),
  // Admission card with notched sides and a perforated stub.
  events: (
    <>
      <path d="M3 6.5h18v3.6a1.9 1.9 0 0 0 0 3.8v3.6H3v-3.6a1.9 1.9 0 0 0 0-3.8Z" />
      <path d="M8 6.5v11" strokeDasharray="1.4 1.4" />
      <path d="M11 10.5h6M11 13.5h4" />
    </>
  ),
  // Film strip: two frames between sprocket rails.
  story: (
    <>
      <path d="M4 3h16v18H4ZM7.5 3v18M16.5 3v18M7.5 12h9" />
      <path d="M5.2 6h1.1M5.2 10h1.1M5.2 14h1.1M5.2 18h1.1M17.7 6h1.1M17.7 10h1.1M17.7 14h1.1M17.7 18h1.1" />
    </>
  ),
  // Framed picture under a gallery picture light.
  gallery: (
    <>
      <path d="M6 3.5h12V5H6ZM12 5v3.5M8.5 5 7 7M15.5 5 17 7" />
      <path d="M3.5 8.5h17v12h-17ZM6.5 11.5h11v6h-11Z" />
    </>
  ),
  // Dance card with a chevron crest and a tasselled cord.
  rsvp: (
    <>
      <path d="M4.5 3h11v18h-11Z" />
      <path d="m8 6.5 2 1.5 2-1.5M7.5 11.5h5M7.5 14.5h5M7.5 17.5h3" />
      <path d="M15.5 5.5h2.5a1.5 1.5 0 0 1 1.5 1.5v8.5M19.5 15.5l1 1.5-1 1.5-1-1.5ZM19.5 18.5V21" />
    </>
  ),
  // Champagne coupe with rising bubbles.
  wishes: (
    <>
      <path d="M4.5 8.5h15c0 3.2-3.4 5-7.5 5s-7.5-1.8-7.5-5ZM12 13.5v6.5M8.5 20.5h7" />
      <circle cx="10" cy="5.8" r=".75" />
      <circle cx="13.8" cy="4.6" r=".75" />
      <circle cx="11.6" cy="2.6" r=".6" />
    </>
  ),
  // Ribboned box with a sharp, angular bow.
  gift: (
    <>
      <path d="M3 8h18v3.5H3ZM4.5 11.5h15v9h-15ZM12 8v12.5" />
      <path d="M12 8 7.5 3.8 7 8M12 8l4.5-4.2.5 4.2" />
    </>
  ),
};

export function NavIcon({ section, className }: { section: NavSectionKey; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="butt"
      strokeLinejoin="miter"
      strokeMiterlimit="10"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[section]}
    </svg>
  );
}
