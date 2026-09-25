"use client";

import { useEffect, useState } from "react";

import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

function validTarget(target: string | null): number | null {
  if (!target || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(target)) return null;
  const calendarDay = new Date(`${target.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(calendarDay.getTime()) || calendarDay.toISOString().slice(0, 10) !== target.slice(0, 10)) return null;
  const timestamp = new Date(`${target}+07:00`).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

function CountdownClock({ target }: { target: number }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()));

  useEffect(() => {
    if (target <= Date.now()) return;
    let active = true;
    const timer = setInterval(() => {
      const next = Math.max(0, target - Date.now());
      setRemaining(next);
      if (next === 0) {
        clearInterval(timer);
        active = false;
      }
    }, 1000);
    return () => { if (active) clearInterval(timer); };
  }, [target]);

  const seconds = Math.ceil(remaining / 1000);
  const units = [
    { label: "Hari", key: "days", value: Math.floor(seconds / 86400) },
    { label: "Jam", key: "hours", value: Math.floor((seconds % 86400) / 3600) },
    { label: "Menit", key: "minutes", value: Math.floor((seconds % 3600) / 60) },
    { label: "Detik", key: "seconds", value: seconds % 60 },
  ];

  return (
    <dl className="tb-countdown-units" aria-label="Waktu menuju acara">
      {units.map(({ label, key, value }) => (
        <div key={key}>
          <dt>{label}</dt>
          <dd data-unit={key} suppressHydrationWarning>{String(value).padStart(2, "0")}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CountdownSection({ target }: { target: string | null }) {
  const timestamp = validTarget(target);
  if (timestamp === null) return null;

  return (
    <Section id="tb-countdown" labelledBy="tb-countdown-heading" tone="bone" className="tb-countdown">
      <SectionHeading id="tb-countdown-heading" title="Menuju hari itu" />
      <CountdownClock target={timestamp} />
    </Section>
  );
}
