import { Botanical } from "../components/Botanical";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

export function HeroSection({ displayName, imageUrl, message }: {
  displayName: string;
  imageUrl: string | null;
  message: string | null;
}) {
  return (
    <Section id="tb-beranda" labelledBy="tb-hero-heading" tone="bone" className={`tb-hero${imageUrl ? "" : " tb-hero-text-only"}`}>
      {imageUrl ? (
        <EditorialImage src={imageUrl} alt={`Potret ${displayName}`} sizes="(min-width: 1360px) 1180px, 88vw" aspectRatio="4 / 3" eager className="tb-hero-image" />
      ) : <Botanical variant="moss" className="tb-hero-botanical" />}
      <div className="tb-hero-copy">
        <h2 id="tb-hero-heading">{displayName}</h2>
        {message?.trim() ? <p>{message}</p> : null}
      </div>
    </Section>
  );
}
