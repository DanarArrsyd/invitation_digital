import type { ReactNode } from "react";
import type { NavSectionKey } from "@/themes/shared/nav-priority";

/** Fine line icons for the invitation navigation. */
const GLYPHS: Record<NavSectionKey, ReactNode> = {
  hero: <><path d="M4 19V5h16v14H4Z" /><path d="M8 9h8M8 13h5" /></>,
  couple: <><circle cx="8" cy="9" r="3" /><circle cx="16" cy="9" r="3" /><path d="M2.5 20c.3-3.8 2-5.5 5.5-5.5s5.2 1.7 5.5 5.5M10.5 20c.3-3.8 2-5.5 5.5-5.5s5.2 1.7 5.5 5.5" /></>,
  events: <><rect x="3" y="5" width="18" height="16" rx="1" /><path d="M7 3v4M17 3v4M3 10h18M8 15h3M14 15h2" /></>,
  story: <><path d="M12 6C9 4.5 6 4.5 3 5v14c3-.5 6-.5 9 1 3-1.5 6-1.5 9-1V5c-3-.5-6-.5-9 1ZM12 6v14" /></>,
  gallery: <><rect x="3" y="4" width="18" height="16" rx="1" /><circle cx="16.5" cy="8.5" r="1.5" /><path d="m4 17 5-5 4 4 2-2 5 4" /></>,
  livestream: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m10 9 5 3-5 3V9Z" /></>,
  rsvp: <><rect x="3" y="5" width="18" height="14" rx="1" /><path d="m4 7 8 6 8-6M8 17h8" /></>,
  wishes: <><path d="M4 4h16v13H8l-4 3V4Z" /><path d="M8 9h8M8 13h6" /></>,
  gift: <><rect x="4" y="9" width="16" height="12" rx="1" /><path d="M3 9h18M12 9v12M12 9C9 8 7 6 8 4c1-2 4 0 4 5Zm0 0c3-1 5-3 4-5-1-2-4 0-4 5Z" /></>,
};

export function NavIcon({ section }: { section: NavSectionKey }) {
  return (
    <svg className="bs-nav-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      {GLYPHS[section]}
    </svg>
  );
}
