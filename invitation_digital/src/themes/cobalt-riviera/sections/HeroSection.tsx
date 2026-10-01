import { CeramicLine, RouteRule } from "../components/RivieraOrnaments";
import { RivieraImage } from "../components/RivieraImage";
import { Section } from "../components/Section";

interface HeroSectionProps {
  displayName: string;
  eventDate: string | null;
  guestDisplayName: string | null;
  imageUrl: string | null;
  message: string | null;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

export function HeroSection({
  displayName,
  eventDate,
  guestDisplayName,
  imageUrl,
  message,
}: HeroSectionProps) {
  const dateLabel = formatDate(eventDate);

  return (
    <Section
      id="cr-beranda"
      labelledBy="cr-hero-heading"
      tone="porcelain"
      className={`cr-hero${imageUrl ? "" : " cr-hero-text-only"}`}
    >
      <div id="cr-foundation" aria-labelledby="cr-foundation-title" className="cr-hero-layout">
        <header className="cr-hero-masthead">
          <p className="cr-kicker">Cobalt Riviera</p>
          <CeramicLine />
        </header>

        {imageUrl ? (
          <RivieraImage
            src={imageUrl}
            alt={`Panorama perayaan ${displayName}`}
            sizes="(min-width: 1440px) 1320px, 100vw"
            aspectRatio="16 / 9"
            eager
            className="cr-hero-image"
          />
        ) : (
          <div className="cr-hero-horizon" aria-hidden="true">
            <span className="cr-hero-horizon-sky" />
            <p className="cr-hero-horizon-name">{displayName}</p>
            <span className="cr-hero-horizon-route">CR / 04</span>
            <span className="cr-hero-horizon-ground" />
          </div>
        )}

        <div className="cr-hero-copy">
          <p className="cr-hero-index">CR / 04</p>
          <h2 id="cr-hero-heading">
            <span id="cr-foundation-title">{displayName}</span>
          </h2>
          <RouteRule />
          {dateLabel ? <time dateTime={eventDate ?? undefined}>{dateLabel}</time> : null}
          {message?.trim() ? <p>{message}</p> : null}
          {guestDisplayName ? <p className="cr-guest">{guestDisplayName}</p> : null}
        </div>
      </div>
    </Section>
  );
}
