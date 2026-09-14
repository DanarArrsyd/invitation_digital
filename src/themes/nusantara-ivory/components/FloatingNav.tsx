"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

export type NavIcon = "home" | "heart" | "calendar" | "gallery" | "book" | "gift" | "message" | "sparkle";

export type NavItem = {
  id: string;
  label: string;
  icon: NavIcon;
};

const ICONS: Record<NavIcon, React.ReactNode> = {
  home: (
    <path d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5M10 20v-6h4v6" />
  ),
  heart: (
    <path d="M12 20.2s-7.6-4.6-9.9-9.3C.6 7.7 2 4.4 5.2 3.7c2-.4 3.9.5 4.8 2.2.9-1.7 2.8-2.6 4.8-2.2 3.2.7 4.6 4 3.1 7.2-2.3 4.7-9.9 9.3-9.9 9.3Z" />
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="1" />
      <path d="M4 10h16M8 3v4M16 3v4" />
      <circle cx="12" cy="14.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  gallery: (
    <>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4.5 17 4.5-5 3.5 3.8L16 12l3.5 5.5" />
    </>
  ),
  book: (
    <path d="M5 4.5h5.5a2 2 0 0 1 2 2V20a1.5 1.5 0 0 0-1.5-1.5H5V4.5ZM19 4.5h-5.5a2 2 0 0 0-2 2V20a1.5 1.5 0 0 1 1.5-1.5H19V4.5Z" />
  ),
  gift: (
    <>
      <rect x="4" y="9.5" width="16" height="10.5" rx="1" />
      <path d="M4 13h16M12 9.5V20" />
      <path d="M12 9.5C9.5 9.5 8 8.2 8 6.6 8 5.2 9 4 10.3 4 11.8 4 12 6.7 12 9.5ZM12 9.5c2.5 0 4-1.3 4-2.9C16 5.2 15 4 13.7 4 12.2 4 12 6.7 12 9.5Z" />
    </>
  ),
  message: (
    <path d="M4 5.5h16v11H9.5L5 20v-3.5H4v-11Z" />
  ),
  sparkle: (
    <path d="M12 3c.6 3.4 1.6 5.4 4 6.7-2.4 1.3-3.4 3.3-4 6.7-.6-3.4-1.6-5.4-4-6.7 2.4-1.3 3.4-3.3 4-6.7ZM19 14.5c.35 1.9.9 3 2.2 3.7-1.3.7-1.85 1.8-2.2 3.7-.35-1.9-.9-3-2.2-3.7 1.3-.7 1.85-1.8 2.2-3.7Z" />
  ),
};

function NavGlyph({ icon }: { icon: NavIcon }) {
  const filled = icon === "sparkle";
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[icon]}
    </svg>
  );
}

/**
 * Scrollspy with a manual fallback: IntersectionObserver alone can be skipped
 * or delayed in throttled/hidden environments (same issue documented for
 * Reveal), so a passive scroll listener double-checks which section's band
 * currently sits closest to the viewport's upper third.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0] ?? "");
  const tickingRef = useRef(false);

  useEffect(() => {
    if (ids.length === 0) return;

    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const pickByGeometry = () => {
      const line = window.innerHeight * 0.32;
      let current = elements[0].id;
      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= line) current = el.id;
      }
      setActive(current);
    };

    const onScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        pickByGeometry();
        tickingRef.current = false;
      });
    };

    pickByGeometry();

    const observer = new IntersectionObserver(
      () => pickByGeometry(),
      { rootMargin: "-32% 0px -55% 0px", threshold: [0, 1] },
    );
    elements.forEach((el) => observer.observe(el));

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

export function FloatingNav({ items }: { items: NavItem[] }) {
  const ids = items.map((item) => item.id);
  const active = useActiveSection(ids);
  const reduced = useReducedMotion() ?? false;

  if (items.length < 2) return null;

  function handleNavigate(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  return (
    <motion.nav
      aria-label="Navigasi undangan"
      className="ni-floating-nav fixed inset-x-0 bottom-0 z-40 flex justify-center"
      initial={reduced ? false : { y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: reduced ? 0 : 1.05 }}
    >
      <ul className="ni-floating-nav-rail">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id} className="relative">
              <button
                type="button"
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? "true" : undefined}
                className="ni-floating-nav-btn"
                data-active={isActive || undefined}
              >
                {isActive ? (
                  <motion.span
                    layoutId="ni-floating-nav-pill"
                    className="ni-floating-nav-pill"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="ni-floating-nav-glyph">
                  <NavGlyph icon={item.icon} />
                </span>
                <span className="ni-floating-nav-label">{item.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </motion.nav>
  );
}
