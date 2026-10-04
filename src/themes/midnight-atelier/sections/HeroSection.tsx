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
      {imageUrl ? null : <AtelierMark className="ma-hero-mark" />}
      <div className="ma-hero-copy">
        <h2 id="ma-hero-heading" className="ma-script">{displayName}</h2>
        {message?.trim() ? <p>{message}</p> : null}
      </div>
      {imageUrl ? (
        <AtelierImage
          src={imageUrl}
          alt={`Potret ${displayName}`}
          sizes="(min-width: 768px) 45vw, 100vw"
          aspectRatio="3 / 4"
          eager
          className="ma-hero-image"
        />
      ) : null}
    </Section>
  );
}
