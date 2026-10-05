import type { ReactElement } from "react";

import type { ThemeSectionKey } from "@/themes/section-contract";

// Seaside travel-folio glyphs drawn on a 24px grid. `cr-route-accent` marks the
// one detail per glyph that takes the tangerine (or, when active, cobalt) stroke.
export const ROUTE_ICON_GLYPHS = {
  // Sun settling on the horizon, with the sea below.
  hero: (
    <>
      <path d="M3 16.5h18M6.5 19.5h4M13.5 19.5h4" />
      <path className="cr-route-accent" d="M7 16.5a5 5 0 0 1 10 0" />
      <path d="M12 6.5V8.5M6.3 9.4l1.3 1.3M17.7 9.4l-1.3 1.3" />
    </>
  ),
  // Two interlocked rings with a small stone.
  couple: (
    <>
      <circle cx="9" cy="14.5" r="5" />
      <circle cx="15" cy="14.5" r="5" />
      <path className="cr-route-accent" d="M13.4 7.6 15 5.5l1.6 2.1L15 9.5Z" />
    </>
  ),
  // Boarding ticket with notched edges and a torn-off stub.
  events: (
    <>
      <path d="M3 7h18v3.5a1.5 1.5 0 0 0 0 3V17H3v-3.5a1.5 1.5 0 0 0 0-3Z" />
      <path className="cr-route-accent" d="M15.5 8.5v1.5M15.5 11.25v1.5M15.5 14v1.5" />
      <path d="M6.5 10.5h5M6.5 13.5h3" />
    </>
  ),
  // Postcard: message lines on the left, stamp on the right.
  story: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="1" />
      <path d="M12.5 8.5v7M6 10h4M6 12.5h4M6 15h2.5" />
      <rect className="cr-route-accent" x="15" y="8" width="3.5" height="4" />
    </>
  ),
  // Camera viewfinder: corner brackets around a lens.
  gallery: (
    <>
      <path d="M4 8.5v-3A1.5 1.5 0 0 1 5.5 4h3M15.5 4h3A1.5 1.5 0 0 1 20 5.5v3M20 15.5v3a1.5 1.5 0 0 1-1.5 1.5h-3M8.5 20h-3A1.5 1.5 0 0 1 4 18.5v-3" />
      <circle cx="12" cy="12" r="3.5" />
      <circle className="cr-route-accent" cx="12" cy="12" r="1" />
    </>
  ),
  // A ship's radio mast sending waves across the sea.
  livestream: (
    <>
      <path d="M12 9v11M9 20h6M12 9l-3 11M12 9l3 11" />
      <circle cx="12" cy="7.5" r="1.5" />
      <path d="M8.2 4.4a5 5 0 0 0 0 6.2M15.8 4.4a5 5 0 0 1 0 6.2" />
      <path className="cr-route-accent" d="M5.6 2.6a8.5 8.5 0 0 0 0 9.8M18.4 2.6a8.5 8.5 0 0 1 0 9.8" />
    </>
  ),
  // Round postmark with wavy cancellation lines and a reply tick.
  rsvp: (
    <>
      <circle cx="9" cy="12" r="6.5" />
      <path d="M15.5 9c1-.7 1.75.7 2.75 0s1.75.7 2.75 0M16.25 12c1-.7 1.75.7 2.75 0s1.75.7 2.75 0M15.5 15c1-.7 1.75.7 2.75 0s1.75.7 2.75 0" />
      <path className="cr-route-accent" d="m6.75 12.2 1.6 1.6 3-3.2" />
    </>
  ),
  // Corked bottle adrift, a rolled note inside.
  wishes: (
    <>
      <g transform="rotate(35 12 11)">
        <path d="M10.5 3.5h3M11 3.5v3l-2.5 2.5v8.5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9L13 6.5v-3" />
        <path className="cr-route-accent" d="M10.75 11.5h2.5v4h-2.5Z" />
      </g>
      <path d="M3 20.5c1.5-1 3-1 4.5 0s3 1 4.5 0 3-1 4.5 0 3 1 4.5 0" />
    </>
  ),
  // Parcel tied with string and a bow.
  gift: (
    <>
      <rect x="3.5" y="8" width="17" height="12" rx="1" />
      <path className="cr-route-accent" d="M12 8v12M3.5 13.5h17" />
      <path d="M12 8c-1.4-2.4-4.5-3.1-4.5-1.2C7.5 7.8 9.6 8 12 8Zm0 0c1.4-2.4 4.5-3.1 4.5-1.2 0 1-2.1 1.2-4.5 1.2Z" />
    </>
  ),
} satisfies Partial<Record<ThemeSectionKey, ReactElement>>;

// Compass rose for any section key without a dedicated glyph.
const COMPASS = (
  <>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 6.5 14 12l-2 5.5-2-5.5Z" />
    <path className="cr-route-accent" d="M12 6.5 14 12h-4Z" />
  </>
);

function hasGlyph(section: ThemeSectionKey): section is keyof typeof ROUTE_ICON_GLYPHS {
  return Object.hasOwn(ROUTE_ICON_GLYPHS, section);
}

export function NavIcon({ section, className }: { section: ThemeSectionKey; className?: string }) {
  const dedicated = hasGlyph(section);

  return (
    <svg
      className={className}
      data-icon={dedicated ? section : "compass"}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {dedicated ? ROUTE_ICON_GLYPHS[section] : COMPASS}
    </svg>
  );
}
