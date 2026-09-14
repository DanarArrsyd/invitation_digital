"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { bodySans } from "../fonts";

export type CalendarEventInput = {
  title: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description?: string | null;
};

/** Wedding venues in this platform are Indonesian; times are entered in WIB. */
const WIB_OFFSET_HOURS = 7;

/** Matches the CSS min-width so the portaled menu can be edge-clamped without a measure pass. */
const MENU_WIDTH = 208;

function toUtcDate(date: string, time: string | null, fallbackHour: number): Date {
  const [h, m] = (time ?? `${String(fallbackHour).padStart(2, "0")}:00`).split(":").map(Number);
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCHours(h - WIB_OFFSET_HOURS, m || 0, 0, 0);
  return d;
}

function formatUtcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function buildTimes(event: CalendarEventInput) {
  const startDate = toUtcDate(event.date, event.startTime, 9);
  const endDate = event.endTime
    ? toUtcDate(event.date, event.endTime, 11)
    : new Date(startDate.getTime() + 2 * 3_600_000);
  return { start: formatUtcStamp(startDate), end: formatUtcStamp(endDate) };
}

function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function buildIcs(event: CalendarEventInput, uid: string): string {
  const { start, end } = buildTimes(event);
  const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Invitation Digital//ID",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(event.title)}`,
    event.location ? `LOCATION:${escapeIcsText(event.location)}` : null,
    event.description ? `DESCRIPTION:${escapeIcsText(event.description)}` : null,
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter((line): line is string => line !== null);
  return lines.join("\r\n");
}

/** Brand mark — kept in Google's own four colors regardless of theme, per brand convention. */
function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="size-[15px]" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9087c1.7018-1.5668 2.6836-3.874 2.6836-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9087-2.2581c-.8059.54-1.8368.8591-3.0477.8591-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.2822-1.1168-.2822-1.71s.1023-1.17.2823-1.71V4.9582H.9573A8.9965 8.9965 0 000 9c0 1.4523.3477 2.8268.9573 4.0418L3.964 10.71z" />
      <path fill="#EA4335" d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z" />
    </svg>
  );
}

/** Monochrome, per Apple's own usage — inherits the item's text color. */
function AppleGlyph() {
  return (
    <svg viewBox="0 0 384 512" className="size-[15px]" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141 0 184.8 0 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-57.7-90-57.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function buildGoogleUrl(event: CalendarEventInput): string {
  const { start, end } = buildTimes(event);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${start}/${end}`,
  });
  if (event.location) params.set("location", event.location);
  if (event.description) params.set("details", event.description);
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

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
    const ics = buildIcs(event, uid);
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
                  className={`ni-theme ${bodySans.variable} ni-addcal-menu`}
                  style={{ position: "absolute", top: menuPos.top, left: menuPos.left, width: MENU_WIDTH }}
                  initial={reduced ? false : { opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
                >
                  <a
                    role="menuitem"
                    href={buildGoogleUrl(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ni-addcal-item"
                    onClick={() => setOpen(false)}
                  >
                    <GoogleGlyph />
                    Google Kalender
                  </a>
                  <button role="menuitem" type="button" onClick={downloadIcs} className="ni-addcal-item">
                    <AppleGlyph />
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
