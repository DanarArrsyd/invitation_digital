import type { ReactElement } from "react";

import type { ThemeSectionKey } from "@/themes/section-contract";

// Pagelaran glyphs on a 24px grid. `kk-nav-accent` marks the one detail per
// glyph that takes the prada stroke (kencana when active).
export const NAV_ICON_GLYPHS = {
  // A small gunungan with its trunk.
  hero: (
    <>
      <path d="M12 3c2.6 3.4 6 6.3 6 10.3 0 3.6-2.7 6.2-6 6.2s-6-2.6-6-6.2C6 9.3 9.4 6.4 12 3Z" />
      <path className="kk-nav-accent" d="M12 19.5V10M12 14l-2.5-2M12 14l2.5-2" />
    </>
  ),
  // Two figures' heads turned toward each other, a diamond between them.
  couple: (
    <>
      <circle cx="7.5" cy="12" r="4.5" />
      <circle cx="16.5" cy="12" r="4.5" />
      <path className="kk-nav-accent" d="m12 9.5 1.6 2.5-1.6 2.5-1.6-2.5Z" />
    </>
  ),
  // A programme sheet with a prada rail on top.
  events: (
    <>
      <path d="M5 5.5h14v14H5Z" />
      <path className="kk-nav-accent" d="M5 8.5h14" />
      <path d="M8 12h3M8 15.5h3M13.5 12H16M13.5 15.5H16" />
    </>
  ),
  // A lontar leaf, bound through its hole.
  story: (
    <>
      <path d="M3.5 9.5h17v5h-17Z" />
      <path d="M7 12h4M14 12h3" />
      <circle className="kk-nav-accent" cx="12.5" cy="12" r=".9" />
    </>
  ),
  // The kelir frame with a gunungan's shadow inside.
  gallery: (
    <>
      <path d="M3.5 5.5h17v13h-17Z" />
      <path className="kk-nav-accent" d="M12 8.5c1.3 1.7 3 3.1 3 5.1 0 1.8-1.3 3-3 3s-3-1.2-3-3c0-2 1.7-3.4 3-5.1Z" />
    </>
  ),
  // The blencong lamp casting its light.
  livestream: (
    <>
      <path d="M8 12.5c0-2.4 1.8-4.5 4-4.5s4 2.1 4 4.5Z" />
      <path d="M12 12.5V20M9.5 20h5" />
      <path className="kk-nav-accent" d="M12 3.5v2M6.3 5.8l1.3 1.3M17.7 5.8l-1.3 1.3" />
    </>
  ),
  // A sealed letter with a reply tick.
  rsvp: (
    <>
      <path d="M3.5 6.5h17v11h-17Z" />
      <path d="m3.5 7 8.5 6 8.5-6" />
      <path className="kk-nav-accent" d="m15.5 15.5 1.5 1.5 3-3" />
    </>
  ),
  // A speech scroll with three dots.
  wishes: (
    <>
      <path d="M4.5 5.5h15v10h-8l-4 4v-4h-3Z" />
      <path className="kk-nav-accent" d="M8.5 10.5h.01M12 10.5h.01M15.5 10.5h.01" />
    </>
  ),
  // A wrapped gift with a ribbon.
  gift: (
    <>
      <path d="M4.5 9.5h15v10h-15ZM3.5 6.5h17v3h-17Z" />
      <path className="kk-nav-accent" d="M12 6.5v13" />
      <path d="M12 6.5c-1.4-2.4-4.5-3.1-4.5-1.2 0 1 2.1 1.2 4.5 1.2Zm0 0c1.4-2.4 4.5-3.1 4.5-1.2 0 1-2.1 1.2-4.5 1.2Z" />
    </>
  ),
} satisfies Partial<Record<ThemeSectionKey, ReactElement>>;

// A plain diamond for any section key without a dedicated glyph.
const DIAMOND = <path className="kk-nav-accent" d="m12 5 5 7-5 7-5-7Z" />;

function hasGlyph(section: ThemeSectionKey): section is keyof typeof NAV_ICON_GLYPHS {
  return Object.hasOwn(NAV_ICON_GLYPHS, section);
}

export function NavIcon({ section, className }: { section: ThemeSectionKey; className?: string }) {
  const dedicated = hasGlyph(section);

  return (
    <svg
      className={className}
      data-icon={dedicated ? section : "diamond"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {dedicated ? NAV_ICON_GLYPHS[section] : DIAMOND}
    </svg>
  );
}
