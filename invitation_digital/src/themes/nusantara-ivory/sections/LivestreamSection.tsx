import type { InvitationEvent } from "@/types/invitation";

import { Reveal } from "../components/Reveal";
import { Section } from "../components/Section";
import { SectionHeading } from "../components/SectionHeading";

export function LivestreamSection({ events }: { events: InvitationEvent[] }) {
  const links = events.filter((event) => event.livestreamUrl);
  if (links.length === 0) return null;

  return (
    <Section tone="ivory">
      <div className="grid gap-8 md:grid-cols-12 md:items-center md:gap-14">
        <div className="md:col-span-5">
          <SectionHeading eyebrow="Ikuti Dari Rumah" title="Live Streaming" align="left" />
        </div>

        <Reveal variant="up" delay={0.08} className="md:col-span-6 md:col-start-7">
          <div className="flex flex-col gap-4">
            {links.map((event) => (
              <a
                key={event.id}
                href={event.livestreamUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-[64px] items-center justify-between gap-6 border-b pb-4 transition-colors"
                style={{ borderColor: "rgba(169,138,92,0.3)" }}
              >
                <span className="ni-serif text-[clamp(1.2rem,2.6vw,1.6rem)] text-[var(--ni-ink)]">
                  {event.title}
                </span>
                <span className="flex items-center gap-3 text-[0.68rem] tracking-[0.28em] uppercase" style={{ color: "var(--ni-gold)" }}>
                  Tonton
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
                </span>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
