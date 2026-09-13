"use client";

import { useEffect, useState } from "react";

import { BotanicalDivider } from "../components/Botanical";
import { Reveal, Stagger, StaggerItem } from "../components/Reveal";

function getTimeLeft(target: number) {
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

const UNITS = [
  { key: "days", label: "Hari" },
  { key: "hours", label: "Jam" },
  { key: "minutes", label: "Menit" },
  { key: "seconds", label: "Detik" },
] as const;

export function CountdownSection({ targetIso }: { targetIso: string | null }) {
  const target = targetIso ? new Date(targetIso).getTime() : null;
  const [timeLeft, setTimeLeft] = useState(() => (target ? getTimeLeft(target) : null));

  useEffect(() => {
    if (!target) return;
    const interval = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000);
    return () => clearInterval(interval);
  }, [target]);

  if (!target || !timeLeft || timeLeft.done) return null;

  return (
    <section
      className="ni-grain ni-panel-dark relative isolate overflow-hidden"
      style={{ paddingBlock: "clamp(4rem,9vw,7.5rem)" }}
    >
      <div className="ni-lattice absolute inset-0 opacity-[0.18]" aria-hidden="true" />

      <div
        className="relative mx-auto flex max-w-[1180px] flex-col items-center gap-10 text-center"
        style={{ paddingInline: "var(--ni-gutter)" }}
      >
        <Reveal variant="fade" className="flex flex-col items-center gap-4">
          <p className="ni-eyebrow" style={{ color: "var(--ni-gold-soft)" }}>
            Menghitung Hari
          </p>
          <BotanicalDivider className="text-[var(--ni-gold-soft)]" />
        </Reveal>

        <Stagger className="grid w-full grid-cols-4 items-start gap-x-1 gap-y-3 sm:gap-x-6" gap={0.08}>
          {UNITS.map((unit, index) => (
            <StaggerItem
              key={unit.key}
              className={`relative flex flex-col items-center gap-2 ${
                index > 0
                  ? "before:absolute before:top-3 before:bottom-8 before:-left-0.5 before:w-px before:bg-[rgba(199,174,133,0.28)] sm:before:-left-3"
                  : ""
              }`}
            >
              <span
                className="ni-serif text-[clamp(2.5rem,10.5vw,8rem)] leading-none tabular-nums"
                style={{ color: "var(--ni-ivory)" }}
              >
                {String(timeLeft[unit.key]).padStart(2, "0")}
              </span>
              <span
                className="text-[0.6rem] tracking-[0.3em] uppercase sm:text-[0.68rem]"
                style={{ color: "var(--ni-gold-soft)" }}
              >
                {unit.label}
              </span>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
