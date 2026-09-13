import type { InvitationEvent } from "@/types/invitation";

import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

function formatTime(time: string): string {
  return time.slice(0, 5);
}

function dateParts(dateStr: string) {
  const date = new Date(dateStr);
  return {
    weekday: new Intl.DateTimeFormat("id-ID", { weekday: "long" }).format(date),
    day: new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(date),
    year: new Intl.DateTimeFormat("id-ID", { year: "numeric" }).format(date),
  };
}

function EventRow({
  event,
  showMaps,
  isFirst,
}: {
  event: InvitationEvent;
  showMaps: boolean;
  isFirst: boolean;
}) {
  const timeRange = [event.startTime, event.endTime]
    .filter((t): t is string => Boolean(t))
    .map(formatTime)
    .join(" – ");
  const { weekday, day, month, year } = dateParts(event.eventDate);

  return (
    <article
      className={`grid gap-6 md:grid-cols-12 md:gap-10 ${
        isFirst ? "" : "mt-12 border-t pt-12 md:mt-16 md:pt-16"
      }`}
      style={isFirst ? undefined : { borderColor: "rgba(169,138,92,0.25)" }}
    >
      <Reveal variant="left" className="ni-event-date md:col-span-4 lg:col-span-3">
        <div className="flex items-end gap-4 md:flex-col md:items-start md:gap-1">
          <span className="ni-display text-[clamp(4.5rem,10vw,8rem)] tabular-nums">{day}</span>
          <div className="flex flex-col pb-2 md:pb-0">
            <span className="ni-serif text-[1.25rem] text-[var(--ni-brown)]">{month}</span>
            <span
              className="text-[0.68rem] tracking-[0.3em] uppercase"
              style={{ color: "var(--ni-gold)" }}
            >
              {year}
            </span>
          </div>
        </div>
      </Reveal>

      <Reveal variant="up" delay={0.08} className="md:col-span-8 lg:col-span-8 lg:col-start-5">
        <div className="flex flex-col gap-4">
          {event.eventType ? <p className="ni-eyebrow">{event.eventType}</p> : null}

          <h3 className="ni-display text-[clamp(1.8rem,4.2vw,2.8rem)]">{event.title}</h3>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <span className="ni-serif text-[1.05rem] text-[var(--ni-brown)]">{weekday}</span>
            {timeRange ? (
              <>
                <span aria-hidden="true" style={{ color: "var(--ni-sand)" }}>
                  ·
                </span>
                <span className="ni-serif text-[1.05rem] text-[var(--ni-brown)]">
                  {timeRange} WIB
                </span>
              </>
            ) : null}
          </div>

          {event.venueName || event.address ? (
            <div className="flex flex-col gap-1 pt-1">
              {event.venueName ? (
                <p className="ni-serif text-[1.2rem] text-[var(--ni-ink)]">{event.venueName}</p>
              ) : null}
              {event.address ? (
                <p className="ni-body max-w-[46ch] text-[0.9rem]">{event.address}</p>
              ) : null}
            </div>
          ) : null}

          {showMaps && event.mapsUrl ? (
            <a
              href={event.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-3 inline-flex min-h-[48px] w-fit items-center gap-3 border px-7 text-[0.7rem] tracking-[0.28em] uppercase transition-colors duration-400"
              style={{ borderColor: "var(--ni-gold)", color: "var(--ni-brown)" }}
            >
              <span className="transition-colors group-hover:text-[var(--ni-ink)]">
                Lihat Lokasi
              </span>
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 transition-transform duration-400 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
          ) : null}
        </div>
      </Reveal>
    </article>
  );
}

export function EventsSection({
  events,
  venueSummary,
  showMaps,
}: {
  events: InvitationEvent[];
  venueSummary: string | null;
  showMaps: boolean;
}) {
  if (events.length === 0 && !venueSummary) return null;

  return (
    <Section className="ni-events" tone="cream" floral wide>
      <SectionHeading title="Rangkaian Acara" align="center" />

      <div className="ni-events-frame mt-10 md:mt-12">
        {events.length > 0 ? (
          events.map((event, index) => (
            <EventRow
              key={event.id}
              event={event}
              showMaps={showMaps}
              isFirst={index === 0}
            />
          ))
        ) : venueSummary ? (
          <Reveal className="py-5 text-center">
            <p className="ni-serif text-[clamp(1.4rem,3.4vw,2rem)] text-[var(--ni-ink)]">
              {venueSummary}
            </p>
          </Reveal>
        ) : null}
      </div>
    </Section>
  );
}
