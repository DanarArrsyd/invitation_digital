import { KelirImage } from "../components/KelirImage";
import { GununganRule } from "../components/Gunungan";
import { Section } from "../components/Section";

interface HeroSectionProps {
  eyebrow: string;
  displayName: string;
  eventDate: string | null;
  venueSummary: string | null;
  guestDisplayName: string | null;
  imageUrl: string | null;
  message: string | null;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

// Talu: the title block leads, then the 3:4 photo clipped to a kayon arch
// (DESIGN 9). Without a photo a large gunungan holds the composition.
export function HeroSection({
  eyebrow,
  displayName,
  eventDate,
  venueSummary,
  guestDisplayName,
  imageUrl,
  message,
}: HeroSectionProps) {
  const dateLabel = formatDate(eventDate);

  return (
    <Section
      id="kk-beranda"
      labelledBy="kk-hero-heading"
      className={`kk-hero ${imageUrl ? "kk-hero-photo" : "kk-hero-text-only"}`}
    >
      <div className="kk-hero-layout">
        <div className="kk-hero-copy">
          <p className="kk-eyebrow"><span className="kk-act">Talu</span><span aria-hidden="true"> · </span>{eyebrow}</p>
          <h2 id="kk-hero-heading" className="kk-script">{displayName}</h2>
          {dateLabel || venueSummary?.trim() ? (
            <p className="kk-hero-meta">
              {dateLabel ? <time dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
              {dateLabel && venueSummary?.trim() ? <span aria-hidden="true"> · </span> : null}
              {venueSummary?.trim() ? <span>{venueSummary}</span> : null}
            </p>
          ) : null}
          {message?.trim() ? <p className="kk-hero-message">{message}</p> : null}
          {guestDisplayName ? <p className="kk-hero-guest">Untuk {guestDisplayName}</p> : null}
        </div>

        {imageUrl ? (
          <div className="kk-hero-arch">
            <KelirImage
              src={imageUrl}
              alt={`Potret ${displayName}`}
              sizes="(min-width: 1200px) 34vw, (min-width: 768px) 46vw, 82vw"
              aspectRatio="3 / 4"
              eager
              className="kk-hero-image"
            />
          </div>
        ) : (
          <GununganRule uid="kk-hero-gunungan" />
        )}
      </div>
    </Section>
  );
}
