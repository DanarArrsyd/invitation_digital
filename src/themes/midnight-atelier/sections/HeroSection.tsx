import { AtelierImage } from "../components/AtelierImage";
import { AtelierMark } from "../components/AtelierMark";
import { Section } from "../components/Section";

export function HeroSection({ displayName, imageUrl, message }: {
  displayName: string;
  imageUrl: string | null;
  message: string | null;
}) {
  return (
    <Section
      id="ma-beranda"
      labelledBy="ma-hero-heading"
      tone="lacquer"
      className={`ma-hero${imageUrl ? "" : " ma-hero-text-only"}`}
    >
      {imageUrl ? (
        <AtelierImage
          src={imageUrl}
          alt={`Potret ${displayName}`}
          sizes="(min-width: 1440px) 1320px, 100vw"
          aspectRatio="16 / 10"
          eager
          className="ma-hero-image"
        />
      ) : (
        <AtelierMark className="ma-hero-mark" />
      )}
      <div className="ma-hero-copy">
        <h2 id="ma-hero-heading">{displayName}</h2>
        {message?.trim() ? <p>{message}</p> : null}
      </div>
    </Section>
  );
}
