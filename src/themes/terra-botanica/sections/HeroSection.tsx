import { Botanical } from "../components/Botanical";
import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

/** Title block first, then the 3:4 portrait (DESIGN.md §9 hero photo rule). */
export function HeroSection({ displayName, imageUrl, message }: {
  displayName: string;
  imageUrl: string | null;
  message: string | null;
}) {
  const copy = (
    <div className="tb-hero-copy">
      <h2 id="tb-hero-heading" className="tb-script">{displayName}</h2>
      {message?.trim() ? <p>{message}</p> : null}
    </div>
  );
  return (
    <Section id="tb-beranda" labelledBy="tb-hero-heading" tone="bone" className={`tb-hero${imageUrl ? "" : " tb-hero-text-only"}`}>
      {imageUrl ? (
        <>
          {copy}
          <EditorialImage src={imageUrl} alt={`Potret ${displayName}`} sizes="(min-width: 1360px) 492px, (min-width: 768px) 40vw, 88vw" aspectRatio="3 / 4" eager className="tb-hero-image" />
        </>
      ) : (
        <>
          <Botanical variant="moss" className="tb-hero-botanical" />
          {copy}
        </>
      )}
    </Section>
  );
}
