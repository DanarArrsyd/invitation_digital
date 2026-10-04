"use client";

import { useEffect, useState } from "react";

import type { CalendarEventInput } from "@/themes/shared/calendar";

import { AddToCalendar } from "../components/AddToCalendar";
import { Section } from "../components/Section";

function CountdownClock({ target }: { target: number }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    if (target <= Date.now()) return;
    const timer = window.setInterval(() => {
      const next = Math.max(0, target - Date.now());
      setRemaining(next);
      if (next === 0) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [target]);

  const seconds = Math.ceil(remaining / 1000);
  const units = [
    { key: "days", label: "Hari", value: Math.floor(seconds / 86400) },
    { key: "hours", label: "Jam", value: Math.floor((seconds % 86400) / 3600) },
    { key: "minutes", label: "Menit", value: Math.floor((seconds % 3600) / 60) },
    { key: "seconds", label: "Detik", value: seconds % 60 },
  ];

  return (
    <dl className="cr-countdown-units" aria-label="Waktu menuju acara">
      {units.map(({ key, label, value }) => (
        <div key={key}>
          <dd data-unit={key} suppressHydrationWarning>{String(value).padStart(2, "0")}</dd>
          <dt>{label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function CountdownSection({
  target,
  calendarEvent,
  calendarUid,
}: {
  target: number | null;
  calendarEvent: CalendarEventInput | null;
  calendarUid: string;
}) {
  const hasTarget = target !== null && Number.isFinite(target);
  if (!hasTarget && !calendarEvent) return null;

  return (
    <Section
      id="cr-countdown"
      labelledBy="cr-countdown-heading"
      tone="cobalt"
      className={hasTarget ? "cr-countdown" : "cr-countdown cr-countdown-calendar-only"}
    >
      <div className="cr-countdown-heading">
        <p>{hasTarget ? "Hitung mundur" : "Tandai kalender Anda"}</p>
        <h2 id="cr-countdown-heading">{hasTarget ? "Menuju hari bahagia" : "Simpan tanggalnya"}</h2>
      </div>
      <div className="cr-countdown-board">
        {hasTarget ? <CountdownClock key={target} target={target} /> : null}
        {calendarEvent ? <AddToCalendar event={calendarEvent} uid={calendarUid} /> : null}
      </div>
    </Section>
  );
}
