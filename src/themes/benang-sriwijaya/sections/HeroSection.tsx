import { EditorialImage } from "../components/EditorialImage";
import { Section } from "../components/Section";

/** Title block first, then the 3:4 portrait (DESIGN.md §9 hero photo rule). */
export function HeroSection({ displayName, imageUrl, message }: {
  displayName: string;
  imageUrl: string | null;
  message: string | null;
}) {
  const copy = (
    <div className="bs-hero-copy">
      <h2 id="bs-hero-heading" className="bs-script">{displayName}</h2>
      {message?.trim() ? <p>{message}</p> : null}
    </div>
  );
  return (
    <Section id="bs-beranda" labelledBy="bs-hero-heading" tone="light" className={`bs-hero${imageUrl ? "" : " bs-hero-text-only"}`}>
      {imageUrl ? (
        <>
          {copy}
          <EditorialImage src={imageUrl} alt={`Potret ${displayName}`} sizes="(min-width: 1360px) 492px, (min-width: 768px) 40vw, 88vw" aspectRatio="3 / 4" eager className="bs-hero-image" />
        </>
      ) : (
        <>
          <span className="bs-hero-mark" aria-hidden="true">B / S</span>
          {copy}
        </>
      )}
    </Section>
  );
}
