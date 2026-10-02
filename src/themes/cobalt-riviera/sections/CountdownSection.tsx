"use client";

import { useEffect, useState } from "react";

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

export function CountdownSection({ target }: { target: number | null }) {
  if (target === null || !Number.isFinite(target)) return null;

  return (
    <Section id="cr-countdown" labelledBy="cr-countdown-heading" tone="cobalt" className="cr-countdown">
      <div className="cr-countdown-heading">
        <p>Next horizon</p>
        <h2 id="cr-countdown-heading">Menuju hari bahagia</h2>
      </div>
      <CountdownClock key={target} target={target} />
    </Section>
  );
}
