import type { ReactNode } from "react";
import type { NavSectionKey } from "@/themes/shared/nav-priority";

/** Sections the floating nav can link to: the shared nav keys, each with a glyph. */
export type TerraNavSection = NavSectionKey;

// Herbarium Cinta field-journal glyphs: hand-drawn line work on a 24px grid, drawn with currentColor.
const GLYPHS: Record<TerraNavSection, ReactNode> = {
  // A pressed sprig.
  hero: (
    <>
      <path d="M6.4 20.6c2.1-4.7 5-9.8 10.9-16.3" />
      <path d="M9.9 14c-2.6-.1-4.4-1.6-5-4.1 2.6 0 4.4 1.4 5 4.1Z" />
      <path d="M11.3 12.3c2.4.6 4.5-.2 5.9-2.4-2.5-.6-4.5.2-5.9 2.4Z" />
      <path d="M13.4 8.3c-.4-2.3.5-4 2.4-5-.1 2.2-.9 3.9-2.4 5Z" />
      <path d="M7.9 17.7c-2.2.6-3.9 0-5-1.7 2-.8 3.7-.3 5 1.7Z" />
    </>
  ),
  // Two stems twined, each ending in a leaf.
  couple: (
    <>
      <path d="M9 21c0-4 6-5.4 6-9.4S11.4 6.4 10.2 3.8" />
      <path d="M15 21c0-4-6-5.4-6-9.4s2.6-5.2 4.8-7.8" />
      <path d="M10.2 3.8c-2.3-.2-3.8.8-4.4 2.8 2.3.3 3.8-.7 4.4-2.8Z" />
      <path d="M13.8 3.8c2.3-.2 3.8.8 4.4 2.8-2.3.3-3.8-.7-4.4-2.8Z" />
    </>
  ),
  // A calendar page with a small leaf.
  events: (
    <>
      <path d="M5.2 6.3c4.5-.4 9.1-.4 13.6 0l-.3 13.9c-4.3.4-8.7.4-13 0Z" />
      <path d="M8.7 3.9v3.7M15.3 3.9v3.7" />
      <path d="M5.4 10.3c4.4-.3 8.8-.3 13.2 0" />
      <path d="M9.3 17.6c.6-2.5 2.4-3.9 5.3-4-.5 2.6-2.3 3.9-5.3 4Zm0 0 2.7-2.2" />
    </>
  ),
  // An open journal with a pressed leaf.
  story: (
    <>
      <path d="M12 6.6C9.8 5 7 4.6 3.6 5.2v13.4c3.4-.6 6.2-.2 8.4 1.4 2.2-1.6 5-2 8.4-1.4V5.2C17 4.6 14.2 5 12 6.6Z" />
      <path d="M12 6.6V20" />
      <path d="M6 9.1c1.4-.2 2.7 0 3.8.5M6 12.1c1.4-.2 2.7 0 3.8.5" />
      <path d="M14.3 15.9c.8-1.9 2.2-2.8 3.9-2.7-.6 1.9-1.9 2.8-3.9 2.7Z" />
    </>
  ),
  // A photo print, slightly askew, held by tape.
  gallery: (
    <>
      <path d="M4.6 7.5 17.2 5.2l2.2 12.6-12.6 2.3Z" />
      <path d="m8.9 5.7 4-1.2.8 2.7-4 1.2Z" />
      <path d="M7.7 16.5c1.6-2.6 3-3.4 4.4-1.8 1-1.3 2.3-1.6 4.4.6" />
      <circle cx="14.4" cy="10.6" r="1.2" />
    </>
  ),
  // An envelope closed with a wax seal.
  rsvp: (
    <>
      <path d="M3.6 6.9c5.6-.3 11.2-.3 16.8 0l-.2 11.3c-5.4.3-10.9.3-16.4 0Z" />
      <path d="m3.9 7.3 8.1 5.8 8.1-5.8" />
      <path d="M12.1 11.2c1.3-.3 2.6.4 2.6 1.7.1 1.3-.9 2.3-2.3 2.3-1.4 0-2.4-.9-2.3-2.2.1-.9.8-1.6 2-1.8Z" fill="currentColor" />
    </>
  ),
  // A dandelion head, one seed already drifting.
  wishes: (
    <>
      <path d="M12 21.2c.4-3.4.3-6.6 0-9.9" />
      <path d="M12 9.8V6.2M12 9.8l2.8-2.4M12 9.8h3.6M12 9.8 9.2 7.4M12 9.8H8.4M12 9.8l2.4 2.6M12 9.8l-2.4 2.6" />
      <circle cx="12" cy="9.8" r=".9" fill="currentColor" />
      <circle cx="12" cy="5.2" r="1" />
      <circle cx="15.6" cy="6.7" r="1" />
      <circle cx="16.6" cy="9.8" r="1" />
      <circle cx="8.4" cy="6.7" r="1" />
      <circle cx="7.4" cy="9.8" r="1" />
      <path d="m17.4 5.2 1.5-1.6" />
      <circle cx="19.6" cy="2.9" r=".9" />
    </>
  ),
  // A parcel tied with twine.
  gift: (
    <>
      <path d="M4.4 9.7c5.1-.3 10.1-.3 15.2 0l-.4 10.2c-4.8.3-9.6.3-14.4 0Z" />
      <path d="M12 9.6V20M4.6 14.5c5-.3 9.9-.3 14.8 0" />
      <path d="M12 9.6C10.3 7 7.7 6.5 7.4 8c-.3 1.4 2.3 1.8 4.6 1.6Zm0 0c1.7-2.6 4.3-3.1 4.6-1.6.3 1.4-2.3 1.8-4.6 1.6Z" />
      <path d="m12 9.6-1.4 2.2M12 9.6l1.6 2" />
    </>
  ),
};

export function NavIcon({ section }: { section: TerraNavSection }) {
  return (
    <svg
      className="tb-nav-icon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {GLYPHS[section]}
    </svg>
  );
}
