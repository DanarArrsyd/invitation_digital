import { EditorialImage } from "../components/EditorialImage";
import { FloralCorner, BotanicalDivider } from "../components/Botanical";
import { Parallax } from "../components/Parallax";
import { Reveal } from "../components/Reveal";

/** `date` is a plain YYYY-MM-DD; format it in UTC so no viewer timezone shifts the day. */
function formatLongDate(date: string | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * With a prewedding photo: names beside an arched portrait. Without one the
 * hero becomes a text composition that leads with the date and venue and
 * points to the event details, rather than showing an empty frame.
 */
export function HeroSection({ coverImageUrl, displayName, eventDate, venueSummary }: {
  coverImageUrl: string | null;
  displayName: string;
  eventDate: string | null;
  venueSummary: string | null;
}) {
  const formatted = formatLongDate(eventDate);

  if (!coverImageUrl) {
    return (
      <section id="ni-beranda" className="ni-hero ni-grain ni-panel-cream relative isolate overflow-hidden">
        <div className="ni-lattice absolute inset-0 opacity-[0.12]" aria-hidden="true" />
        <FloralCorner className="ni-hero-floral" />
        <div className="ni-hero-inner ni-hero-inner--text">
          <Reveal variant="fade"><BotanicalDivider /></Reveal>
          <Reveal delay={0.08}>
            <h1 className="ni-script ni-hero-names mt-8">{displayName}</h1>
          </Reveal>
          {formatted ? (
            <Reveal delay={0.16}>
              <p className="ni-serif mt-8 text-[clamp(1.6rem,4.6vw,2.6rem)] leading-tight text-[var(--ni-ink)]">
                {formatted}
              </p>
            </Reveal>
          ) : null}
          {venueSummary ? (
            <Reveal delay={0.2}>
              <p className="ni-body mt-3 max-w-[40ch] text-base">{venueSummary}</p>
            </Reveal>
          ) : null}
          <Reveal delay={0.26}>
            <a
              href="#ni-acara"
              className="mt-10 inline-flex min-h-[44px] items-center gap-3 border-b text-[0.72rem] tracking-[0.24em] uppercase transition-colors hover:text-[var(--ni-ink)]"
              style={{ borderColor: "var(--ni-line-strong)", color: "var(--ni-brown)" }}
            >
              Lihat detail acara
            </a>
          </Reveal>
        </div>
      </section>
    );
  }

  return (
    <section id="ni-beranda" className="ni-hero ni-grain ni-panel-cream relative isolate overflow-hidden">
      <div className="ni-lattice absolute inset-0 opacity-[0.12]" aria-hidden="true" />
      <FloralCorner className="ni-hero-floral" />
      <div className="ni-hero-inner">
        <div className="relative min-w-0">
          <Reveal variant="fade"><BotanicalDivider /></Reveal>
          <Reveal delay={0.08}>
            <h1 className="ni-script ni-hero-names my-8">{displayName}</h1>
          </Reveal>
          {formatted || venueSummary ? (
            <Reveal delay={0.16} className="max-w-[34ch] border-t border-[var(--ni-sand)] pt-6">
              {formatted ? <p className="ni-serif text-xl sm:text-2xl">{formatted}</p> : null}
              {venueSummary ? <p className="ni-body mt-2 text-base">{venueSummary}</p> : null}
            </Reveal>
          ) : null}
        </div>
        <Reveal variant="mask" delay={0.12} className="ni-hero-portrait">
          <div className="ni-hero-photo-frame">
            <Parallax className="absolute inset-[-8%_0]" distance={16}>
              <EditorialImage
                src={coverImageUrl}
                alt={`Foto prewedding ${displayName}`}
                sizes="(min-width: 768px) 480px, 92vw"
                priority
                className="ni-photo"
              />
            </Parallax>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
