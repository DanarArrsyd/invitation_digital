"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  buildGoogleCalendarUrl,
  buildIcsCalendar,
  type CalendarEventInput,
} from "@/themes/shared/calendar";
export type { CalendarEventInput } from "@/themes/shared/calendar";

import { AppleGlyph, GoogleGlyph } from "@/themes/shared/action-icons";

import { bodyFace } from "../fonts";

/** Matches the CSS min-width so the portaled menu can be edge-clamped without a measure pass. */
const MENU_WIDTH = 208;


export function AddToCalendar({ event, uid }: { event: CalendarEventInput; uid: string }) {
  const [open, setOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (containerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // The countdown panel clips overflow for its grain/lattice texture, so the
  // menu is portaled to <body> with a manually tracked position instead of
  // being absolutely positioned inside that clipped stacking context.
  useEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const margin = 12;
      const idealLeft = rect.left + rect.width / 2 - MENU_WIDTH / 2;
      const clampedLeft = Math.min(Math.max(idealLeft, margin), window.innerWidth - MENU_WIDTH - margin);
      setMenuPos({ top: rect.bottom + window.scrollY + 8, left: clampedLeft + window.scrollX });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, { passive: true });
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  function downloadIcs() {
    const ics = buildIcsCalendar(event, uid, new Date());
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="ni-addcal-trigger"
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
          <rect x="4" y="5.5" width="16" height="14.5" rx="1" />
          <path d="M4 10h16M8 3v4M16 3v4M12 14v3M10.5 15.5h3" />
        </svg>
        Tambah ke Kalender
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  ref={menuRef}
                  role="menu"
                  className={`ni-theme ${bodyFace.variable} ni-addcal-menu`}
                  style={{ position: "absolute", top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
                  initial={reduced ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <a
                    role="menuitem"
                    href={buildGoogleCalendarUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ni-addcal-item"
                    onClick={() => setOpen(false)}
                  >
                    <GoogleGlyph className="size-[15px]" />
                    Google Kalender
                  </a>
                  <button role="menuitem" type="button" onClick={downloadIcs} className="ni-addcal-item">
                    <AppleGlyph className="size-[15px]" />
                    Apple / Outlook (.ics)
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </div>
  );
}
