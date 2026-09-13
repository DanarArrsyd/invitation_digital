import { EditorialImage } from "../components/EditorialImage";
import { FloralCorner, BotanicalDivider } from "../components/Botanical";
import { Parallax } from "../components/Parallax";
import { Reveal } from "../components/Reveal";

function formatLongDate(date: string | null): string | null {
  if (!date) return null;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/** Names and a dedicated prewedding portrait share the opening composition. */
export function HeroSection({ coverImageUrl, displayName, eventDate, venueSummary }: {
  coverImageUrl: string | null;
  displayName: string;
  eventDate: string | null;
  venueSummary: string | null;
}) {
  const formatted = formatLongDate(eventDate);
  return (
    <section className="ni-hero ni-grain ni-panel-cream relative isolate overflow-hidden">
      <div className="ni-lattice absolute inset-0 opacity-[0.12]" aria-hidden="true" />
      <FloralCorner className="ni-hero-floral" />
      <div className="ni-hero-inner">
        <div className="relative min-w-0">
          <Reveal variant="fade"><BotanicalDivider /></Reveal>
          <Reveal delay={0.08}>
            <h1 className="ni-display ni-hero-names my-8">{displayName}</h1>
          </Reveal>
          {formatted || venueSummary ? (
            <Reveal delay={0.16} className="max-w-[34ch] border-t border-[var(--ni-sand)] pt-6">
              {formatted ? <p className="ni-serif text-xl sm:text-2xl">{formatted}</p> : null}
              {venueSummary ? <p className="ni-body mt-2 text-sm">{venueSummary}</p> : null}
            </Reveal>
          ) : null}
        </div>
        <Reveal variant="mask" delay={0.12} className="ni-hero-portrait">
          <div className="ni-hero-photo-frame">
            {coverImageUrl ? (
              <Parallax className="absolute inset-[-8%_0]" distance={16}>
                <EditorialImage src={coverImageUrl} alt={`Foto prewedding ${displayName}`} priority className="ni-photo" />
              </Parallax>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
                <BotanicalDivider />
                <p className="ni-serif text-2xl text-[var(--ni-brown-soft)]">Foto prewedding</p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
